import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/order-email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = body as {
      orderId?: string;
      razorpayOrderId?: string;
      razorpayPaymentId?: string;
      razorpaySignature?: string;
    };

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        razorpayOrderId: true,
        status: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "CONFIRMED") {
      return NextResponse.json({
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
      });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || "";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
    const allowMockFallback = process.env.NODE_ENV !== "production";

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Razorpay credentials are not configured" }, { status: 500 });
    }

    if (keyId.includes("mock") || (allowMockFallback && order.razorpayOrderId?.startsWith("mock_rzp_"))) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "CONFIRMED",
          razorpayPaymentId: razorpayPaymentId || `mock_pay_${order.id}`,
        },
      });

      try {
        await sendOrderConfirmationEmail(order.id);
      } catch (error) {
        console.error("Mock payment confirmation email failed:", error);
      }

      return NextResponse.json({
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: "CONFIRMED",
      });
    }

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: "Missing payment verification fields" }, { status: 400 });
    }

    if (!order.razorpayOrderId || order.razorpayOrderId !== razorpayOrderId) {
      return NextResponse.json({ error: "Order id mismatch" }, { status: 400 });
    }

    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${order.razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "CONFIRMED",
        razorpayPaymentId,
      },
    });

    try {
      await sendOrderConfirmationEmail(order.id);
    } catch (error) {
      console.error("Payment confirmation email failed:", error);
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: "CONFIRMED",
    });
  } catch (error) {
    console.error("Payment verification failed:", error);
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}
