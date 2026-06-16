import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;

  const collection = await prisma.collection.findUnique({
    where: { slug },
    include: {
      products: {
        where: { status: "LIVE" },
        orderBy: [{ collectionOrder: "asc" }, { createdAt: "desc" }],
      },
    },
  });

  if (!collection) {
    return NextResponse.json({ error: "Collection not found" }, { status: 404 });
  }

  return NextResponse.json(collection);
}
