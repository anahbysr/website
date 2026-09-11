import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

/**
 * Serves files from `public/uploads` at request time.
 *
 * Next.js snapshots the `public` folder when the server starts, so images
 * uploaded through the admin portal after a deploy are not served statically
 * until the next restart. Files already present in that snapshot are still
 * served by the static handler (it is checked before app routes); this handler
 * only receives requests for uploads added since the server started.
 */

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const CONTENT_TYPES: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function notFound() {
  return new NextResponse("Not found", { status: 404 });
}

async function resolveUpload(segments: string[]) {
  if (segments.length === 0) {
    return null;
  }

  let decoded: string[];
  try {
    decoded = segments.map((segment) => decodeURIComponent(segment));
  } catch {
    return null;
  }

  if (decoded.some((segment) => !segment || segment === "." || segment === "..")) {
    return null;
  }

  const target = path.join(UPLOAD_DIR, ...decoded);
  const relative = path.relative(UPLOAD_DIR, target);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return null;
  }

  const contentType = CONTENT_TYPES[path.extname(target).toLowerCase()];
  if (!contentType) {
    return null;
  }

  try {
    const stats = await stat(target);
    if (!stats.isFile()) {
      return null;
    }
    return { target, contentType, stats };
  } catch {
    return null;
  }
}

function buildHeaders(contentType: string, size: number, mtimeMs: number) {
  const etag = `"${createHash("sha1").update(`${size}-${mtimeMs}`).digest("hex")}"`;

  return {
    "Content-Type": contentType,
    "Content-Length": String(size),
    "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    ETag: etag,
    "Last-Modified": new Date(mtimeMs).toUTCString(),
  };
}

export async function GET(
  req: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await context.params;
  const resolved = await resolveUpload(segments);

  if (!resolved) {
    return notFound();
  }

  const headers = buildHeaders(
    resolved.contentType,
    resolved.stats.size,
    resolved.stats.mtimeMs,
  );

  if (req.headers.get("if-none-match") === headers.ETag) {
    return new NextResponse(null, { status: 304, headers });
  }

  const file = await readFile(resolved.target);

  return new NextResponse(new Uint8Array(file), { status: 200, headers });
}

export async function HEAD(
  _req: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await context.params;
  const resolved = await resolveUpload(segments);

  if (!resolved) {
    return notFound();
  }

  return new NextResponse(null, {
    status: 200,
    headers: buildHeaders(
      resolved.contentType,
      resolved.stats.size,
      resolved.stats.mtimeMs,
    ),
  });
}
