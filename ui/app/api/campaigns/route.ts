import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const {
      title,
      description,
      category,
      imageUrl,
      goal,
      duration,
      token,
      wallet,
      campaignAddress,
    } = await request.json();

    if (
      !title ||
      !description ||
      !category ||
      !goal ||
      !duration ||
      !token ||
      !wallet ||
      !campaignAddress
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        walletAddress: wallet,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        title,
        description,
        category,
        imageUrl,
        goal: Number(goal),
        daysLeft: duration,
        creatorId: user.id,
        campaignAddress,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
