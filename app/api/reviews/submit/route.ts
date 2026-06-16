import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { productId, orderId, orderReference, customerName, city, rating, text } = await req.json();

    if (!productId || !customerName || !rating || !text) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let resolvedOrderId: string | null = orderId || null;

    if (!resolvedOrderId && orderReference) {
      const order = await prisma.order.findFirst({
        where: {
          OR: [{ id: String(orderReference) }, { orderNumber: String(orderReference) }],
        },
        select: { id: true },
      });
      resolvedOrderId = order?.id ?? null;
    }

    const review = await prisma.review.create({
      data: {
        productId,
        orderId: resolvedOrderId,
        author: customerName,
        city: city || "India",
        rating: parseInt(rating, 10),
        body: text,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, reviewId: review.id });
  } catch (error) {
    console.error("Failed to submit review:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
