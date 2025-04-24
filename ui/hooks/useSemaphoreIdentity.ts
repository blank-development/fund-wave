import { useState, useEffect } from "react";
import { Identity } from "@semaphore-protocol/identity";
import { Group } from "@semaphore-protocol/group";
import { useContractRead } from "wagmi";
import CampaignABI from "@/lib/contracts/Campaign.json";
import { BigNumber } from "ethers";

export function useSemaphoreIdentity(campaignAddress: string) {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [group, setGroup] = useState<Group | null>(null);

  // Read group ID from contract
  const { data: groupId } = useContractRead({
    address: campaignAddress as `0x${string}`,
    abi: CampaignABI,
    functionName: "groupId",
  });

  useEffect(() => {
    // Create a new identity if none exists
    if (!identity) {
      const newIdentity = new Identity();
      setIdentity(newIdentity);
    }

    // Create a new group if groupId is available
    if (groupId && !group) {
      const newGroup = new Group([BigNumber.from(groupId)]);
      setGroup(newGroup);
    }
  }, [groupId, identity, group]);

  return {
    identity,
    group,
    groupId: groupId ? Number(groupId) : undefined,
  };
}
