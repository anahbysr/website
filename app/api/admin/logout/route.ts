import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { destroyAdminSession } from "@/lib/admin-session";

export async function POST() {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get("admin_token")?.value;
  destroyAdminSession(cookieValue);
  cookieStore.set("admin_token", "", { path: "/", maxAge: 0 });
  return NextResponse.json({ success: true });
}
