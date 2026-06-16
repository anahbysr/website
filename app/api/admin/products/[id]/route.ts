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
  const product = await prisma.product.findUnique({
    where: { id },
    include: { collection: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const body = await req.json();
  const sizes = body.sizes || [];
  const totalStock = sizes.reduce(
    (sum: number, entry: { stock?: number }) => sum + Math.max(0, Number(entry.stock) || 0),
    0,
  );

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: body.name,
      slug: body.slug,
      description: body.description || null,
      price: Number(body.price),
      salePrice: body.salePrice ? Number(body.salePrice) : null,
      badge: body.badge || null,
      allowCustomization: Boolean(body.allowCustomization),
      customizationLabel: body.customizationLabel || null,
      customizationHelp: body.customizationHelp || null,
      status: totalStock > 0 ? (body.status || "DRAFT") : "DRAFT",
      images: JSON.stringify(body.images || []),
      sizes: JSON.stringify(sizes),
      collectionId: body.collectionId || null,
      collectionOrder: Number(body.collectionOrder || 0),
      fabric: body.fabric || "Cotton",
      ageFrom: Number(body.ageFrom || 0),
      ageTo: Number(body.ageTo || 0),
    },
  });

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/collections");
  revalidatePath(`/shop/${product.slug}`);
  return NextResponse.json(product);
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  await prisma.product.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/collections");
  return NextResponse.json({ success: true });
}
