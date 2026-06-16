import { notFound } from "next/navigation";
import CheckoutPaymentClient from "@/components/CheckoutPaymentClient";
import { prisma } from "@/lib/prisma";
import { getStorefrontConfig } from "@/lib/storefront";

export default async function CheckoutPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string | string[] }>;
}) {
  const resolvedSearchParams = await searchParams;
  const orderId = Array.isArray(resolvedSearchParams.order)
    ? resolvedSearchParams.order[0]
    : resolvedSearchParams.order;

  if (!orderId) {
    notFound();
  }

  const [order, config] = await Promise.all([
    prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        razorpayOrderId: true,
        status: true,
      },
    }),
    getStorefrontConfig(),
  ]);

  if (!order || !order.razorpayOrderId) {
    notFound();
  }

  return (
    <CheckoutPaymentClient
      orderId={order.id}
      orderNumber={order.orderNumber || order.id}
      amount={Math.max(Math.round(order.total * 100), 100)}
      customerName={order.customerName}
      customerEmail={order.customerEmail || ""}
      customerPhone={order.customerPhone || ""}
      razorpayOrderId={order.razorpayOrderId}
      status={order.status}
      whatsappNumber={config.whatsappNumber}
    />
  );
}
