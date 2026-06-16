import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { reference, contact } = await req.json();
    const normalizedReference = String(reference || "").trim();
    const normalizedContact = String(contact || "").trim();

    if (!normalizedReference || !normalizedContact) {
      return NextResponse.json(
        { error: "Order reference and email or phone are required." },
        { status: 400 },
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ orderNumber: normalizedReference }, { id: normalizedReference }],
        AND: [
          {
            OR: [
              { customerEmail: normalizedContact },
              { customerPhone: normalizedContact },
            ],
          },
        ],
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        trackingNumber: true,
        courier: true,
        notes: true,
        address: true,
        createdAt: true,
        items: true,
        total: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "We could not find a matching order. Double-check the reference and contact details." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ...order,
      items: JSON.parse(order.items || "[]"),
    });
  } catch (error) {
    console.error("Order tracking lookup failed:", error);
    return NextResponse.json({ error: "Unable to track order right now." }, { status: 500 });
  }
}
