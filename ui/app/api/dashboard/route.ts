import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log(session);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's campaigns
    const userCampaigns = await prisma.project.findMany({
      where: {
        creator: {
          email: session.user.email,
        },
      },
      include: {
        creator: true,
        contributions: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get campaigns backed by the user
    const backedCampaigns = await prisma.contribution.findMany({
      where: {
        contributor: {
          email: session.user.email,
        },
      },
      include: {
        project: {
          include: {
            creator: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate analytics
    const totalRaised = userCampaigns.reduce(
      (sum, campaign) =>
        sum +
        campaign.contributions.reduce(
          (campaignSum, contribution) => campaignSum + contribution.amount,
          0
        ),
      0
    );

    const totalBackers = userCampaigns.reduce(
      (sum, campaign) => sum + campaign.contributions.length,
      0
    );

    const averageContribution =
      totalBackers > 0 ? totalRaised / totalBackers : 0;

    // Get daily views (last 7 days)
    const dailyViews = await prisma.projectView.findMany({
      where: {
        project: {
          creator: {
            email: session.user.email,
          },
        },
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Group views by day
    const viewsByDay = dailyViews.reduce((acc, view) => {
      const day = view.createdAt.toISOString().split("T")[0];
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Format response
    const response = {
      userCampaigns: userCampaigns.map((campaign) => ({
        id: campaign.id,
        title: campaign.title,
        image: campaign.imageUrl || "/placeholder.svg",
        goal: campaign.goal,
        raised: campaign.contributions.reduce(
          (sum, contribution) => sum + contribution.amount,
          0
        ),
        backers: campaign.contributions.length,
        daysLeft: Math.max(
          0,
          Math.ceil(
            (new Date(campaign.endDate).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24)
          )
        ),
        status:
          campaign.status === "ACTIVE"
            ? "active"
            : campaign.status === "SUCCESSFUL"
            ? "successful"
            : "failed",
      })),
      backedCampaigns: backedCampaigns.map((contribution) => ({
        id: contribution.project.id,
        title: contribution.project.title,
        creator: `${contribution.project.creator.firstName} ${contribution.project.creator.lastName}`,
        image: contribution.project.imageUrl || "/placeholder.svg",
        contribution: contribution.amount,
        date: contribution.createdAt.toISOString(),
        status:
          contribution.project.status === "ACTIVE" ? "active" : "successful",
      })),
      analytics: {
        totalRaised,
        totalBackers,
        averageContribution,
        conversionRate: 4.2, // This would need to be calculated based on actual data
        dailyViews: Object.values(viewsByDay),
        referralSources: [
          { source: "Direct", percentage: 40 },
          { source: "Social Media", percentage: 30 },
          { source: "Search", percentage: 15 },
          { source: "Email", percentage: 10 },
          { source: "Other", percentage: 5 },
        ],
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
