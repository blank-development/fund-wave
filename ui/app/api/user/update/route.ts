import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateUserSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  username: z.string().min(3).max(30).optional(),
  location: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
});

export async function PUT(req: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = updateUserSchema.parse(body);

    // Check if email is being updated and if it's already taken
    if (validatedData.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: validatedData.email,
          id: { not: payload.userId },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 400 }
        );
      }
    }

    // Check if username is being updated and if it's already taken
    if (validatedData.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: validatedData.username,
          id: { not: payload.userId },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 400 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: validatedData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        location: true,
        bio: true,
        avatarUrl: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
