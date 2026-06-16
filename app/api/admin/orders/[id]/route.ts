import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-auth";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const order = await prisma.order.findUnique({ where: { id } });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const body = await req.json();

  const order = await prisma.order.update({
    where: { id },
    data: {
      status: body.status,
      trackingNumber: body.trackingNumber || null,
      courier: body.courier || null,
      notes: body.notes || null,
    },
  });

  revalidatePath("/admin/orders");
  return NextResponse.json(order);
}
