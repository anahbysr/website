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
  const productIds: string[] = body.productIds || [];

  await prisma.$transaction(async (tx) => {
    await tx.product.updateMany({
      where: { collectionId: id, id: { notIn: productIds } },
      data: { collectionId: null, collectionOrder: 0 },
    });

    await Promise.all(
      productIds.map((productId, index) =>
        tx.product.update({
          where: { id: productId },
          data: {
            collectionId: id,
            collectionOrder: index,
          },
        }),
      ),
    );
  });

  revalidatePath("/");
  revalidatePath("/collections");
  return NextResponse.json({ success: true });
}
