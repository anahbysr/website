import { unlink } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";

export async function DELETE(req: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { url } = await req.json();

  if (typeof url !== "string" || !url.startsWith("/uploads/")) {
    return NextResponse.json({ error: "Invalid upload URL" }, { status: 400 });
  }

  const targetPath = path.join(process.cwd(), "public", url.replace(/^\//, ""));

  try {
    await unlink(targetPath);
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
