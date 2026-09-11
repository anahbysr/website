import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { confirmOrderPayment, markPaymentFailed, recordRefund } from "@/lib/order-payment";

/**
 * Razorpay webhook receiver.
 *
 * Registered in the Razorpay dashboard (Settings > Webhooks) for
 * `payment.captured`, `order.paid`, `payment.failed` and `refund.processed`,
 * with the same secret as RAZORPAY_WEBHOOK_SECRET.
 *
 * Successful payments are also confirmed by the browser callback in
 * /api/orders/verify; this is the safety net for customers who pay and close
 * the tab. Failures and refunds only ever arrive here.
 */

type PaymentEntity = {
  id?: string;
  order_id?: string;
  method?: string;
  amount?: number;
  amount_refunded?: number;
  error_description?: string;
  error_reason?: string;
};

type RefundEntity = {
  payment_id?: string;
};

type WebhookPayload = {
  event?: string;
  payload?: {
    payment?: { entity?: PaymentEntity };
    refund?: { entity?: RefundEntity };
  };
};

function isValidSignature(rawBody: string, signature: string | null, secret: string) {
  if (!signature) {
    return false;
  }

  const expected = Buffer.from(
    crypto.createHmac("sha256", secret).update(rawBody).digest("hex"),
  );
  const received = Buffer.from(signature);

  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

async function findOrderIds(where: { razorpayOrderId?: string; razorpayPaymentId?: string }) {
  const conditions = [
    where.razorpayPaymentId ? { razorpayPaymentId: where.razorpayPaymentId } : null,
    where.razorpayOrderId ? { razorpayOrderId: where.razorpayOrderId } : null,
  ].filter((condition): condition is NonNullable<typeof condition> => condition !== null);

  if (conditions.length === 0) {
    return [];
  }

  const orders = await prisma.order.findMany({
    where: { OR: conditions },
    select: { id: true },
  });

  return orders.map((order) => order.id);
}

export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

  if (!secret) {
    // Returning an error makes Razorpay retry, so no event is lost once the
    // secret is configured.
    console.error("RAZORPAY_WEBHOOK_SECRET is not configured; rejecting webhook.");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const rawBody = await req.text();
  const skipVerification = process.env.NODE_ENV !== "production" && secret.includes("mock");

  if (!skipVerification && !isValidSignature(rawBody, req.headers.get("x-razorpay-signature"), secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let payload: WebhookPayload;

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const payment = payload.payload?.payment?.entity;

  try {
    switch (payload.event) {
      case "payment.captured":
      case "order.paid": {
        if (payment?.id && payment.order_id) {
          for (const orderId of await findOrderIds({ razorpayOrderId: payment.order_id })) {
            await confirmOrderPayment(orderId, payment.id, payment.method);
          }
        }
        break;
      }

      case "payment.failed": {
        if (payment?.order_id) {
          for (const orderId of await findOrderIds({ razorpayOrderId: payment.order_id })) {
            await markPaymentFailed(
              orderId,
              payment.error_description || payment.error_reason,
              payment.method,
            );
          }
        }
        break;
      }

      case "refund.processed": {
        const paymentId = payload.payload?.refund?.entity?.payment_id || payment?.id;

        if (paymentId) {
          const orderIds = await findOrderIds({
            razorpayPaymentId: paymentId,
            razorpayOrderId: payment?.order_id,
          });

          for (const orderId of orderIds) {
            await recordRefund(orderId, Number(payment?.amount_refunded), Number(payment?.amount));
          }
        }
        break;
      }

      default:
        // Other events are acknowledged and ignored so Razorpay stops retrying.
        break;
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
