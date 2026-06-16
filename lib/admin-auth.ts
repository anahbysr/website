import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/admin-session";

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return validateAdminSession(cookieStore.get("admin_token")?.value);
}

export async function requireAdminApi() {
  const authed = await isAdminAuthenticated();

  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
