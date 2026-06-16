import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminSession } from "@/lib/admin-session";

export async function POST(req: Request) {
  const { password } = await req.json();

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Admin password not configured" }, { status: 500 });
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const session = createAdminSession();
  const cookieStore = await cookies();
  cookieStore.set("admin_token", session.cookieValue, {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: 24 * 60 * 60,
    secure: process.env.NODE_ENV === "production",
  });

  return NextResponse.json({ success: true });
}
