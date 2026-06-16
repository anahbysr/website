import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const collections = await prisma.collection.findMany({
    orderBy: { order: "asc" },
    include: {
      products: {
        where: { status: "LIVE" },
        orderBy: [{ collectionOrder: "asc" }, { createdAt: "desc" }],
      },
    },
  });

  return NextResponse.json(collections.filter((collection) => collection.products.length > 0));
}
