import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-auth";

export async function GET(req: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const collectionId = searchParams.get("collectionId");

  const products = await prisma.product.findMany({
    where: {
      ...(status && status !== "ALL" ? { status } : {}),
      ...(collectionId && collectionId !== "ALL" ? { collectionId } : {}),
    },
    include: { collection: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const sizes = body.sizes || [];
  const totalStock = sizes.reduce(
    (sum: number, entry: { stock?: number }) => sum + Math.max(0, Number(entry.stock) || 0),
    0,
  );
  const product = await prisma.product.create({
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
  return NextResponse.json(product);
}
