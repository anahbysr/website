import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!process.env.RAZORPAY_KEY_ID?.includes("mock")) {
      return NextResponse.json({ error: "Mock payments disabled" }, { status: 403 });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: "CONFIRMED" },
    });

    console.log(`[MOCK RAZORPAY] Payment successful for order ${orderId}`);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Mock payment failed" }, { status: 500 });
  }
}
