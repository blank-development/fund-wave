import { ethers } from "ethers";
import { Group } from "@semaphore-protocol/group";
import { Identity } from "@semaphore-protocol/identity";
import { generateProof } from "@semaphore-protocol/proof";
import CampaignFactoryABI from "@/abi/CampaignFactory.json";
import CampaignABI from "@/abi/Campaign.json";
import prisma from "./db";

const CAMPAIGN_FACTORY_ADDRESS =
  process.env.NEXT_PUBLIC_CAMPAIGN_FACTORY_ADDRESS!;
const SEMAPHORE_ADDRESS = process.env.NEXT_PUBLIC_SEMAPHORE_ADDRESS!;

export interface CampaignInfo {
  owner: string;
  goal: bigint;
  raised: bigint;
  deadline: bigint;
  token: string;
}

export interface CampaignData {
  id: string;
  address: string;
  owner: string;
  goal: bigint;
  raised: bigint;
  deadline: bigint;
  token: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  creator: {
    id: string;
    username?: string;
    avatarUrl?: string;
  };
}

export async function createCampaign(
  goal: bigint,
  duration: number,
  token: string,
  title: string,
  description: string,
  category: string,
  imageUrl?: string,
  creatorId?: string
): Promise<CampaignData> {
  try {
    // Create campaign on-chain
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const factory = new ethers.Contract(
      CAMPAIGN_FACTORY_ADDRESS,
      CampaignFactoryABI,
      signer
    );

    const tx = await factory.createCampaign(
      goal,
      duration,
      token,
      SEMAPHORE_ADDRESS
    );
    const receipt = await tx.wait();

    // Get the campaign address from the event
    const event = receipt.logs.find(
      (log: any) => log.fragment?.name === "CampaignCreated"
    );
    const campaignAddress = event.args.campaign;

    // Create campaign in database
    const campaign = await prisma.project.create({
      data: {
        title,
        description,
        category,
        imageUrl,
        goal: Number(goal),
        daysLeft: duration,
        campaignAddress,
        creatorId: creatorId!,
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

    return {
      id: campaign.id,
      address: campaignAddress,
      ownerId: campaign.creator.id,
      goal,
      raised: BigInt(0),
      deadline: BigInt(Math.floor(Date.now() / 1000) + duration * 24 * 60 * 60),
      token,
      title: campaign.title,
      description: campaign.description,
      category: campaign.category,
      imageUrl: campaign.imageUrl || undefined,
    };
  } catch (error) {
    console.error("Error creating campaign:", error);
    throw error;
  }
}

export async function contributeToCampaign(
  campaignAddress: string,
  amount: bigint
): Promise<void> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const campaign = new ethers.Contract(campaignAddress, CampaignABI, signer);

    const tx = await campaign.contribute(amount);
    await tx.wait();
  } catch (error) {
    console.error("Error contributing to campaign:", error);
    throw error;
  }
}

export async function submitAnonymousComment(
  campaignAddress: string,
  comment: string,
  identity: Identity,
  group: Group
): Promise<void> {
  try {
    // Generate proof
    const proof = await generateProof(identity, group, comment);

    // Submit comment on-chain
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const campaign = new ethers.Contract(campaignAddress, CampaignABI, signer);

    const tx = await campaign.submitAnonymousComment(proof, comment);
    await tx.wait();
  } catch (error) {
    console.error("Error submitting anonymous comment:", error);
    throw error;
  }
}

export async function getCampaignInfo(
  campaignAddress: string
): Promise<CampaignInfo> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const campaign = new ethers.Contract(
      campaignAddress,
      CampaignABI,
      provider
    );

    const info = await campaign.campaignInfo();
    return {
      owner: info.owner,
      goal: info.goal,
      raised: info.raised,
      deadline: info.deadline,
      token: info.token,
    };
  } catch (error) {
    console.error("Error getting campaign info:", error);
    throw error;
  }
}

export async function getCampaigns(): Promise<CampaignData[]> {
  try {
    // Get campaigns from database
    const projects = await prisma.project.findMany({
      where: {
        campaignAddress: {
          not: null,
        },
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

    // Get on-chain data for each campaign
    const campaigns = await Promise.all(
      projects.map(async (project) => {
        const info = await getCampaignInfo(project.campaignAddress!);
        return {
          id: project.id,
          address: project.campaignAddress!,
          owner: info.owner,
          goal: info.goal,
          raised: info.raised,
          deadline: info.deadline,
          token: info.token,
          title: project.title,
          description: project.description,
          category: project.category,
          imageUrl: project.imageUrl || undefined,
          creator: project.creator,
        };
      })
    );

    return campaigns;
  } catch (error) {
    console.error("Error getting campaigns:", error);
    throw error;
  }
}
