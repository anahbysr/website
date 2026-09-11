import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(req: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      {
        error: `Unsupported file type${file.type ? ` (${file.type})` : ""}. Please upload a JPG, PNG, WebP or GIF image. iPhone photos saved as HEIC must be converted to JPG first.`,
      },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `File is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Please upload an image under 10MB.` },
      { status: 400 },
    );
  }

  const sanitizedName = file.name.replace(/\s+/g, "-");
  const filename = `${Date.now()}-${sanitizedName}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const targetPath = path.join(uploadDir, filename);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(targetPath, Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ url: `/uploads/${filename}` });
}
