import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: {
        id: params.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        updates: {
          orderBy: {
            createdAt: "desc",
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
            replyTo: {
              include: {
                user: {
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
        },
        contributions: {
          select: {
            amount: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Calculate total raised from contributions
    const totalRaised = project.contributions.reduce(
      (sum, contribution) => sum + Number(contribution.amount),
      0
    );

    // Format the response
    const formattedProject = {
      id: project.id,
      title: project.title,
      description: project.description,
      category: project.category,
      imageUrl: project.imageUrl,
      campaignAddress: project.campaignAddress,
      goal: project.goal,
      raised: totalRaised,
      backers: project.contributions.length,
      daysLeft: project.daysLeft,
      creator: {
        id: project.creator.id,
        name: project.creator.username || "Anonymous",
        image: project.creator.avatarUrl || "/placeholder.svg",
        campaigns: 0, // You might want to add this to your schema
        backedProjects: 0, // You might want to add this to your schema
      },
      updates: project.updates.map((update) => ({
        title: update.title,
        date: new Date(update.createdAt).toLocaleDateString(),
        content: update.content,
      })),
      comments: project.comments.map((comment) => ({
        id: comment.id,
        user: {
          name: comment.user.username || "Anonymous",
          image: comment.user.avatarUrl || "/placeholder.svg",
        },
        date: new Date(comment.createdAt).toLocaleDateString(),
        content: comment.content,
        replyTo: comment.replyTo?.user.username,
        is_creator: comment.user.id === project.creator.id,
      })),
    };

    return NextResponse.json(formattedProject);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
