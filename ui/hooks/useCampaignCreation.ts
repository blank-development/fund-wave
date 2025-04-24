import { ethers } from "ethers";
import CampaignFactoryABI from "@/abi/CampaignFactory.json";
import { CampaignData } from "@/lib/campaign";
import { useBaseHook } from "./useBaseHook";

const CAMPAIGN_FACTORY_ADDRESS =
  process.env.NEXT_PUBLIC_CAMPAIGN_FACTORY_ADDRESS!;
const SEMAPHORE_ADDRESS = process.env.NEXT_PUBLIC_SEMAPHORE_ADDRESS!;
const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS!;

export function useCampaignCreation() {
  const { isLoading, error, withLoading } = useBaseHook();

  const createCampaign = async (
    goal: bigint,
    daysLeft: number,
    token: string,
    title: string,
    description: string,
    category: string,
    imageUrl?: string,
    creatorId?: string
  ): Promise<CampaignData> => {
    return withLoading(async () => {
      try {
        // Create campaign on-chain
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const factory = new ethers.Contract(
          CAMPAIGN_FACTORY_ADDRESS,
          CampaignFactoryABI,
          signer
        );

        // Convert days to seconds
        const duration = BigInt(daysLeft * 24 * 60 * 60);

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

        if (!event) {
          throw new Error(
            "CampaignCreated event not found in transaction receipt"
          );
        }

        const campaignAddress = event.args.campaign;

        // Create campaign in database
        const response = await fetch("/api/campaigns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            category,
            imageUrl,
            goal: goal.toString(),
            duration: Number(duration),
            token,
            wallet: await signer.getAddress(),
            campaignAddress,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(
            error.error || "Failed to create campaign in database"
          );
        }

        const { project } = await response.json();

        return {
          id: project.id,
          address: campaignAddress,
          owner: project.creator.id,
          goal,
          raised: BigInt(0),
          deadline: BigInt(Math.floor(Date.now() / 1000) + Number(duration)),
          token,
          title: project.title,
          description: project.description,
          category: project.category,
          imageUrl: project.imageUrl || undefined,
          creator: {
            id: project.creator.id,
            username: project.creator.username || undefined,
            avatarUrl: project.creator.avatarUrl || undefined,
          },
        };
      } catch (error) {
        console.error("Campaign creation error:", error);
        if (error instanceof Error) {
          throw new Error(`Failed to create campaign: ${error.message}`);
        }
        throw new Error("Failed to create campaign");
      }
    });
  };

  return {
    isLoading,
    error,
    createCampaign,
  };
}
