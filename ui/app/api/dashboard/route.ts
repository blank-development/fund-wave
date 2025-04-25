import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getAllContributions, getContributions } from "@/lib/graphql";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
    });

    // Get user's campaigns
    const userCampaigns = await prisma.project.findMany({
      where: {
        creator: {
          id: payload.userId,
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
        userId: payload.userId,
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

    const { totalRaised, totalBackers } = await getAllContributions();

    const averageContribution =
      totalBackers > 0 ? totalRaised / totalBackers : 0;

    const enrichedUserCampaigns = await Promise.all(
      userCampaigns.map(async (campaign) => {
        const contributions = await getContributions(campaign.campaignAddress);

        return {
          id: campaign.id,
          title: campaign.title,
          image: campaign.imageUrl || "/placeholder.svg",
          goal: campaign.goal,
          raised: contributions.totalRaised,
          backers: contributions.backers,
          daysLeft: Math.max(
            0,
            Math.ceil(
              (new Date(campaign.daysLeft).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24)
            )
          ),
        };
      })
    );

    // Format response
    const response = {
      user,
      userCampaigns: enrichedUserCampaigns,
      backedCampaigns: backedCampaigns.map((contribution) => ({
        id: contribution.project.id,
        title: contribution.project.title,
        creator: `${contribution.project.creator.firstName} ${contribution.project.creator.lastName}`,
        image: contribution.project.imageUrl || "/placeholder.svg",
        contribution: contribution.amount,
        date: contribution.createdAt.toISOString(),
      })),
      analytics: {
        totalRaised,
        totalBackers,
        averageContribution,
        conversionRate: 4.2, // This would need to be calculated based on actual data
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
    console.error("Error in dashboard:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
