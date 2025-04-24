import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
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

    const formData = await request.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Create unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `avatar-${uniqueSuffix}-${file.name}`;

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), "public", "uploads");
    try {
      await writeFile(join(uploadDir, filename), buffer);
    } catch (error) {
      // If directory doesn't exist, create it
      if (error.code === "ENOENT") {
        await writeFile(join(uploadDir, filename), buffer);
      } else {
        throw error;
      }
    }

    // Update user's avatar URL in database
    const avatarUrl = `/uploads/${filename}`;
    await prisma.user.update({
      where: { id: payload.userId },
      data: { avatarUrl },
    });

    return NextResponse.json({ url: avatarUrl });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload avatar" },
      { status: 500 }
    );
  }
}
