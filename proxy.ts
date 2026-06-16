import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/admin-session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const isAuthed = validateAdminSession(request.cookies.get("admin_token")?.value);

  if (!isAuthed) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
