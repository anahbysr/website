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

  const collection = await prisma.collection.update({
    where: { id },
    data: {
      name: body.name,
      slug: body.slug,
      description: body.description || null,
      coverImage: body.coverImage || null,
      order: Number(body.order || 0),
    },
  });

  revalidatePath("/");
  revalidatePath("/collections");
  revalidatePath(`/collections/${collection.slug}`);
  return NextResponse.json(collection);
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;

  await prisma.product.updateMany({
    where: { collectionId: id },
    data: { collectionId: null, collectionOrder: 0 },
  });
  await prisma.collection.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/collections");
  return NextResponse.json({ success: true });
}
