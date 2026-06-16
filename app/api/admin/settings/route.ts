import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-auth";

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const settings = await prisma.settings.findMany();
  return NextResponse.json(Object.fromEntries(settings.map((item) => [item.key, item.value])));
}

export async function PATCH(req: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const updates = await req.json();

  await Promise.all(
    Object.entries(updates).map(([key, value]) =>
      prisma.settings.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      }),
    ),
  );

  revalidatePath("/");
  revalidatePath("/our-story");
  revalidatePath("/care-guide");
  revalidatePath("/size-guide");
  revalidatePath("/shipping-policy");
  revalidatePath("/privacy-policy");
  revalidatePath("/returns-exchange");
  revalidatePath("/track-order");
  revalidatePath("/write-review");
  revalidatePath("/collections");
  revalidatePath("/shop");

  return NextResponse.json({ success: true });
}
