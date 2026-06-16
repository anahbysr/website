import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-auth";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const body = await req.json();

  const existingReview = await prisma.review.findUnique({
    where: { id },
    include: { product: { include: { collection: true } } },
  });

  if (!existingReview) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  const review = await prisma.review.update({
    where: { id },
    data: { status: body.status },
  });

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/collections");
  revalidatePath(`/shop/${existingReview.product.slug}`);
  if (existingReview.product.collection?.slug) {
    revalidatePath(`/collections/${existingReview.product.collection.slug}`);
  }
  return NextResponse.json(review);
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const existingReview = await prisma.review.findUnique({
    where: { id },
    include: { product: { include: { collection: true } } },
  });

  if (!existingReview) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  await prisma.review.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/collections");
  revalidatePath(`/shop/${existingReview.product.slug}`);
  if (existingReview.product.collection?.slug) {
    revalidatePath(`/collections/${existingReview.product.collection.slug}`);
  }
  return NextResponse.json({ success: true });
}
