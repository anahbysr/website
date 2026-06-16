import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-auth";

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const collections = await prisma.collection.findMany({
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(collections);
}

export async function POST(req: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const collection = await prisma.collection.create({
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
  return NextResponse.json(collection);
}
