import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get total raised across all projects
    const totalRaised = await prisma.project.aggregate({
      _sum: {
        raised: true,
      },
    });

    // Get total number of backers
    const totalBackers = await prisma.project.aggregate({
      _sum: {
        backers: true,
      },
    });

    // Get average contribution amount
    const contributions = await prisma.contribution.aggregate({
      _avg: {
        amount: true,
      },
    });

    // Get number of active campaigns (campaigns with daysLeft > 0)
    const activeCampaigns = await prisma.project.count({
      where: {
        daysLeft: {
          gt: 0,
        },
      },
    });

    // Get total number of successful campaigns (campaigns that reached their goal)
    const successfulCampaigns = await prisma.project.count({
      where: {
        raised: {
          gte: prisma.project.fields.goal,
        },
      },
    });

    // Get total number of projects
    const totalProjects = await prisma.project.count();

    // Get recent contributions
    const recentContributions = await prisma.contribution.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        project: {
          select: {
            title: true,
          },
        },
      },
    });

    return NextResponse.json({
      totalRaised: totalRaised._sum.raised || 0,
      totalBackers: totalBackers._sum.backers || 0,
      averageContribution: contributions._avg.amount || 0,
      activeCampaigns,
      successfulCampaigns,
      totalProjects,
      successRate:
        totalProjects > 0 ? (successfulCampaigns / totalProjects) * 100 : 0,
      recentContributions: recentContributions.map((contribution) => ({
        amount: contribution.amount,
        userName: `${contribution.user.firstName} ${contribution.user.lastName}`,
        projectTitle: contribution.project.title,
        date: contribution.createdAt,
      })),
    });
  } catch (error) {
    console.error("Statistics error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
