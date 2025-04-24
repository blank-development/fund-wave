import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  try {
    let where = {};
    if (projectId) {
      where = { ...where, projectId };
    }

    const updates = await prisma.update.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            title: true,
            creator: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ updates });
  } catch (error) {
    console.error("Error fetching updates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { projectId, title, content } = await request.json();

    if (!projectId || !title || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify that the project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const update = await prisma.update.create({
      data: {
        projectId,
        title,
        content,
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({ update });
  } catch (error) {
    console.error("Error creating update:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const updateId = searchParams.get("id");

  if (!updateId) {
    return NextResponse.json(
      { error: "Update ID is required" },
      { status: 400 }
    );
  }

  try {
    await prisma.update.delete({
      where: { id: updateId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting update:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
