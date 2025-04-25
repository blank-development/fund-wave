import { NextResponse } from "next/server";
import { getCampaignData, getContributions } from "@/lib/graphql";
import prisma from "@/lib/db";
import { Project } from "@prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const creatorId = searchParams.get("creatorId");

  try {
    let where = {};
    if (category) {
      where = { ...where, category };
    }
    if (creatorId) {
      where = { ...where, creatorId };
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            firstName: true,
            lastName: true,
            walletAddress: true,
          },
        },
        updates: true,
        comments: {
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
        contributions: {
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
    });

    console.log(projects);

    // Fetch and merge GraphQL data for each project
    const enrichedProjects = await Promise.all(
      projects.map(async (project: Project) => {
        if (project.campaignAddress) {
          const campaignData = await getCampaignData(project.campaignAddress);
          const contributions = await getContributions(project.campaignAddress);
          if (campaignData) {
            return {
              ...project,
              raised: contributions.totalRaised,
              backers: contributions.backers,
              onchain_data: {
                raised: campaignData.raised,
                deadline: campaignData.deadline,
                token: campaignData.token,
                onchain_contributions: campaignData.contributions,
              },
            };
          }
        }
        return project;
      })
    );

    console.log(enrichedProjects);

    return NextResponse.json({ projects: enrichedProjects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const {
      title,
      description,
      category,
      imageUrl,
      goal,
      daysLeft,
      creatorId,
    } = await request.json();

    if (!creatorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        category,
        imageUrl,
        goal,
        daysLeft,
        creatorId,
      },
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
