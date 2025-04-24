import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { register } from "@/lib/auth";
import { z } from "zod";

const registerSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, password } = registerSchema.parse(body);

    const { user, token } = await register(
      firstName,
      lastName,
      email,
      password
    );

    // Set the session cookie
    const cookieStore = cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error in register:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Something went wrong",
      },
      { status: 400 }
    );
  }
}
