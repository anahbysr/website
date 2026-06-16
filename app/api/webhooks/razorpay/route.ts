import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/order-email";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

    if (!secret.includes("mock")) {
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);

    if (payload.event === "payment.captured" || payload.event === "order.paid") {
      const payment = payload.payload.payment?.entity;
      const razorpayOrderId = payment?.order_id;
      const razorpayPaymentId = payment?.id;

      if (razorpayOrderId && razorpayPaymentId) {
        const updatedOrders = await prisma.order.findMany({
          where: { razorpayOrderId },
          select: { id: true },
        });

        await prisma.order.updateMany({
          where: { razorpayOrderId },
          data: {
            status: "CONFIRMED",
            razorpayPaymentId,
          },
        });

        for (const order of updatedOrders) {
          try {
            await sendOrderConfirmationEmail(order.id);
          } catch (error) {
            console.error(`Webhook confirmation email failed for order ${order.id}:`, error);
          }
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
