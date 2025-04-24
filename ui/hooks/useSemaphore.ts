import { useContractWrite, useTransaction } from "wagmi";
import { generateProof, packToSolidityProof } from "@semaphore-protocol/proof";
import { Identity } from "@semaphore-protocol/identity";
import { Group } from "@semaphore-protocol/group";
import CampaignABI from "@/lib/contracts/Campaign.json";

export function useSemaphore(campaignAddress: string) {
  const { writeContract: joinGroup, data: joinGroupData } = useContractWrite({
    address: campaignAddress as `0x${string}`,
    abi: CampaignABI,
    functionName: "joinGroup",
  });

  const { writeContract: submitComment, data: submitCommentData } =
    useContractWrite({
      address: campaignAddress as `0x${string}`,
      abi: CampaignABI,
      functionName: "submitAnonymousComment",
    });

  const { isLoading: isJoining, isSuccess: isJoinSuccess } = useTransaction({
    hash: joinGroupData,
  });

  const { isLoading: isSubmitting, isSuccess: isSubmitSuccess } =
    useTransaction({
      hash: submitCommentData,
    });

  const joinSemaphoreGroup = async (identity: Identity) => {
    const identityCommitment = identity.generateCommitment();
    joinGroup({
      address: campaignAddress as `0x${string}`,
      abi: CampaignABI,
      functionName: "joinGroup",
      args: [identityCommitment],
    });
  };

  const submitAnonymousComment = async (
    identity: Identity,
    group: Group,
    comment: string
  ) => {
    const { proof, publicSignals } = await generateProof(
      identity,
      group,
      comment
    );
    const solidityProof = packToSolidityProof(proof);

    submitComment({
      address: campaignAddress as `0x${string}`,
      abi: CampaignABI,
      functionName: "submitAnonymousComment",
      args: [
        group.depth,
        group.root,
        publicSignals.nullifierHash,
        publicSignals.signalHash,
        solidityProof,
      ],
    });
  };

  return {
    joinSemaphoreGroup,
    submitAnonymousComment,
    isJoining,
    isSubmitting,
    isJoinSuccess,
    isSubmitSuccess,
  };
}
