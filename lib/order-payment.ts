import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/order-email";

/**
 * Payment state changes driven by Razorpay.
 *
 * Razorpay can report the same payment several times: the browser callback,
 * webhooks, and webhook retries, in any order. Every function here is
 * therefore idempotent and conditional, so a repeated or late event never
 * sends a second email or moves an order backwards.
 *
 * `status` is fulfilment (PENDING, CONFIRMED, DISPATCHED, DELIVERED,
 * CANCELLED). `paymentStatus` is money (PENDING, PAID, FAILED, REFUNDED,
 * PARTIALLY_REFUNDED). They are updated independently.
 */

// Payment states that a new successful payment may replace. A customer can
// fail once and then pay successfully, so FAILED must be upgradable.
const UNPAID_STATES = ["PENDING", "FAILED"];

async function recordPaymentMethod(orderId: string, method?: string | null) {
  if (!method) {
    return;
  }

  // Only fill it in once; the browser callback does not know the method, so it
  // usually arrives later with the webhook.
  await prisma.order.updateMany({
    where: { id: orderId, paymentMethodDetail: null },
    data: { paymentMethodDetail: method },
  });
}

/**
 * Records a successful payment. A PENDING order becomes CONFIRMED and the
 * customer is emailed, exactly once. For an order in any other fulfilment
 * state the money is still recorded as PAID, so a payment on a CANCELLED
 * order shows up in admin as needing a refund.
 *
 * Returns true when this call confirmed the order.
 */
export async function confirmOrderPayment(
  orderId: string,
  razorpayPaymentId: string,
  method?: string | null,
) {
  const { count } = await prisma.order.updateMany({
    where: { id: orderId, status: "PENDING" },
    data: {
      status: "CONFIRMED",
      paymentStatus: "PAID",
      paymentFailureReason: null,
      razorpayPaymentId,
    },
  });

  await recordPaymentMethod(orderId, method);

  if (count > 0) {
    try {
      await sendOrderConfirmationEmail(orderId);
    } catch (error) {
      console.error(`Confirmation email failed for order ${orderId}:`, error);
    }

    return true;
  }

  // Fulfilment already moved on (or was cancelled). Record the money without
  // touching fulfilment status.
  await prisma.order.updateMany({
    where: { id: orderId, paymentStatus: { in: UNPAID_STATES } },
    data: { paymentStatus: "PAID", paymentFailureReason: null, razorpayPaymentId },
  });

  const existing = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true, orderNumber: true },
  });

  if (existing?.status === "CANCELLED") {
    console.warn(
      `Payment ${razorpayPaymentId} received for CANCELLED order ${existing.orderNumber ?? orderId}; refund may be needed.`,
    );
  }

  return false;
}

/**
 * Records a failed payment attempt. Never overrides a successful payment: a
 * failure event can arrive after the customer retried and paid.
 */
export async function markPaymentFailed(
  orderId: string,
  reason: string | null | undefined,
  method?: string | null,
) {
  await prisma.order.updateMany({
    where: { id: orderId, paymentStatus: { in: UNPAID_STATES } },
    data: {
      paymentStatus: "FAILED",
      paymentFailureReason: reason?.slice(0, 300) || "Payment failed",
    },
  });

  await recordPaymentMethod(orderId, method);
}

/**
 * Records a refund using Razorpay's running total for the payment, so
 * duplicate or out-of-order refund events always converge on the right amount.
 * Amounts are in paise, as Razorpay sends them.
 */
export async function recordRefund(
  orderId: string,
  amountRefundedPaise: number,
  paymentAmountPaise: number,
) {
  if (!Number.isFinite(amountRefundedPaise) || amountRefundedPaise <= 0) {
    return;
  }

  const fullyRefunded =
    Number.isFinite(paymentAmountPaise) && paymentAmountPaise > 0
      ? amountRefundedPaise >= paymentAmountPaise
      : false;

  const amountRefunded = amountRefundedPaise / 100;

  // Only move forward: an older event with a smaller running total that
  // arrives late must not lower the refunded amount.
  await prisma.order.updateMany({
    where: { id: orderId, amountRefunded: { lte: amountRefunded } },
    data: {
      paymentStatus: fullyRefunded ? "REFUNDED" : "PARTIALLY_REFUNDED",
      amountRefunded,
    },
  });
}
