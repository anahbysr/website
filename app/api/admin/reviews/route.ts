import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-auth";

export async function GET(req: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const reviews = await prisma.review.findMany({
    where: status && status !== "ALL" ? { status } : undefined,
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reviews);
}
