import { NextRequest, NextResponse } from "next/server";
import { signAdminToken } from "@/lib/admin/adminAuth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email?.trim()?.toLowerCase();
    const password = body.password;

    const envEmail = (process.env.ADMIN_EMAIL || "admin@youthemployment.ca").trim().toLowerCase();
    const envPassword = process.env.ADMIN_PASSWORD || "Admin@12345";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (email !== envEmail || password !== envPassword) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }

    const token = signAdminToken({ email, role: "admin" });

    const response = NextResponse.json({
      success: true,
      message: "Logged in successfully.",
    });

    response.cookies.set({
      name: "admin_token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);
    return NextResponse.json(
      { error: "Failed to process login request." },
      { status: 500 }
    );
  }
}
