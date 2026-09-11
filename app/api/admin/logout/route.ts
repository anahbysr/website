import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  // Sessions are stateless signed tokens, so clearing the cookie ends the
  // session; there is no server-side record to delete.
  cookieStore.set("admin_token", "", { path: "/", maxAge: 0 });
  return NextResponse.json({ success: true });
}
