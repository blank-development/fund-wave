import { ethers } from "ethers";
import CampaignABI from "@/abi/Campaign.json";
import { CampaignInfo, CampaignData } from "@/lib/campaign";
import { useBaseHook } from "./useBaseHook";

export function useCampaignInfo() {
  const { isLoading, error, withLoading } = useBaseHook();

  const getCampaignInfo = async (
    campaignAddress: string
  ): Promise<CampaignInfo> => {
    return withLoading(async () => {
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
    });
  };

  const getCampaigns = async (): Promise<CampaignData[]> => {
    return withLoading(async () => {
      const response = await fetch("/api/campaigns");
      if (!response.ok) {
        throw new Error("Failed to fetch campaigns");
      }

      const { campaigns } = await response.json();
      return campaigns;
    });
  };

  return {
    isLoading,
    error,
    getCampaignInfo,
    getCampaigns,
  };
}
