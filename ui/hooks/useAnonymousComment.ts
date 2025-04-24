import { ethers } from "ethers";
import { Group } from "@semaphore-protocol/group";
import { Identity } from "@semaphore-protocol/identity";
import { generateProof } from "@semaphore-protocol/proof";
import CampaignABI from "@/abi/Campaign.json";
import { useBaseHook } from "./useBaseHook";

export function useAnonymousComment() {
  const { isLoading, error, withLoading } = useBaseHook();

  const submitAnonymousComment = async (
    campaignAddress: string,
    comment: string,
    identity: Identity,
    group: Group
  ): Promise<void> => {
    return withLoading(async () => {
      // Generate proof
      const proof = await generateProof(identity, group, comment, {
        wasmFilePath: "/semaphore.wasm",
        zkeyFilePath: "/semaphore.zkey",
      });

      // Submit comment on-chain
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const campaign = new ethers.Contract(
        campaignAddress,
        CampaignABI,
        signer
      );

      const tx = await campaign.submitAnonymousComment(proof, comment);
      await tx.wait();
    });
  };

  return {
    isLoading,
    error,
    submitAnonymousComment,
  };
}
