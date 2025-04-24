import { ethers } from "ethers";
import CampaignABI from "@/abi/Campaign.json";
import { useBaseHook } from "./useBaseHook";

export function useCampaignContribution() {
  const { isLoading, error, withLoading } = useBaseHook();

  const contributeToCampaign = async (
    campaignAddress: string,
    amount: bigint
  ): Promise<void> => {
    return withLoading(async () => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const campaign = new ethers.Contract(
        campaignAddress,
        CampaignABI,
        signer
      );

      const tx = await campaign.contribute(amount);
      await tx.wait();
    });
  };

  return {
    isLoading,
    error,
    contributeToCampaign,
  };
}
