import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStorefrontConfig } from "@/lib/storefront";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string | string[]; order_id?: string | string[] }>;
}) {
  const resolvedSearchParams = await searchParams;
  const orderId = Array.isArray(resolvedSearchParams.order)
    ? resolvedSearchParams.order[0]
    : resolvedSearchParams.order;
  const legacyOrderNumber = Array.isArray(resolvedSearchParams.order_id)
    ? resolvedSearchParams.order_id[0]
    : resolvedSearchParams.order_id;

  const [order, config] = await Promise.all([
    orderId
      ? prisma.order.findUnique({
        where: { id: orderId },
        select: { id: true, orderNumber: true, status: true },
      })
      : legacyOrderNumber
        ? prisma.order.findUnique({
          where: { orderNumber: legacyOrderNumber },
          select: { id: true, orderNumber: true, status: true },
        })
        : Promise.resolve(null),
    getStorefrontConfig(),
  ]);

  if (!order) {
    notFound();
  }

  const whatsappHref = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(
    `Hi, I need help with order ${order.orderNumber || order.id}.`,
  )}`;
  const paymentConfirmed = order.status === "CONFIRMED";

  return (
    <div className="container mx-auto max-w-2xl px-4 py-20 text-center">
      <div className={`mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full text-4xl ${paymentConfirmed ? "bg-sage/20 text-sage" : "bg-coral/15 text-coral"}`}>
        {paymentConfirmed ? "✓" : "!"}
      </div>

      <h1 className="mb-4 text-4xl font-serif text-deepbrown">
        {paymentConfirmed ? "Thank You for Your Order!" : "Payment Still Pending"}
      </h1>

      <p className="mb-2 text-lg text-bodytext">
        {paymentConfirmed
          ? "Your payment was successful and your order has been placed."
          : "We could not confirm your payment yet. Please retry payment or reach out to us on WhatsApp for further assistance."}
      </p>

      <p className="mb-8 text-sm text-taupe">Order ID: {order.orderNumber || order.id}</p>

      <div className="mb-8 rounded-sm bg-cream p-8 text-left">
        <h2 className="mb-4 font-serif text-xl text-deepbrown">
          {paymentConfirmed ? "What&apos;s Next?" : "Need Help?"}
        </h2>
        {paymentConfirmed ? (
          <ul className="list-disc space-y-2 pl-5 text-bodytext">
            <li>You will receive an order confirmation email shortly.</li>
            <li>We will begin processing your order within 24 hours.</li>
            <li>Once shipped, you will receive a tracking link via email and SMS.</li>
          </ul>
        ) : (
          <ul className="list-disc space-y-2 pl-5 text-bodytext">
            <li>Your order is saved, but it has not been confirmed yet.</li>
            <li>You can go back to the payment page and retry the payment.</li>
            <li>If you need help, contact us on WhatsApp and we will assist you.</li>
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
        {paymentConfirmed ? (
          <Link href="/shop" className="btn-primary inline-block">
            Continue Shopping
          </Link>
        ) : (
          <Link href={`/checkout/payment?order=${order.id}`} className="btn-primary inline-block">
            Retry Payment
          </Link>
        )}
        {!paymentConfirmed ? (
          <a href={whatsappHref} target="_blank" rel="noreferrer" className="btn-outline inline-block">
            Contact on WhatsApp
          </a>
        ) : null}
      </div>
    </div>
  );
}
