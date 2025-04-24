import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const userId = searchParams.get("userId");

  try {
    let where = {};
    if (projectId) {
      where = { ...where, projectId };
    }
    if (userId) {
      where = { ...where, userId };
    }

    const contributions = await prisma.contribution.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
            goal: true,
            raised: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ contributions });
  } catch (error) {
    console.error("Error fetching contributions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { projectId, userId, amount } = await request.json();

    if (!projectId || !userId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Start a transaction to update both contribution and project
    const contribution = await prisma.$transaction(async (tx) => {
      // Create the contribution
      const contribution = await tx.contribution.create({
        data: {
          projectId,
          userId,
          amount,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      });

      // Update the project's raised amount and backers count
      await tx.project.update({
        where: { id: projectId },
        data: {
          raised: {
            increment: amount,
          },
          backers: {
            increment: 1,
          },
        },
      });

      return contribution;
    });

    return NextResponse.json({ contribution });
  } catch (error) {
    console.error("Error creating contribution:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
