import { NextResponse } from "next/server";
import { sendAdminPasswordResetEmail } from "@/lib/admin-credentials";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    await sendAdminPasswordResetEmail(String(email || ""));

    return NextResponse.json({
      success: true,
      message: "If that email matches the admin account, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Admin forgot password failed:", error);
    return NextResponse.json({ error: "Unable to send reset link right now." }, { status: 500 });
  }
}
