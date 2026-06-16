import { NextResponse } from "next/server";
import { resetAdminPassword } from "@/lib/admin-credentials";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();
    const nextPassword = String(password || "");

    if (nextPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long." }, { status: 400 });
    }

    const result = await resetAdminPassword(String(token || ""), nextPassword);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin reset password failed:", error);
    return NextResponse.json({ error: "Unable to reset password right now." }, { status: 500 });
  }
}
