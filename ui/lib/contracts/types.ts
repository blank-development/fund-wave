export interface CampaignInfo {
  owner: string;
  goal: bigint;
  raised: bigint;
  deadline: bigint;
  token: string;
}

export interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignAddress: string;
  tokenAddress: string;
  onContributionSuccess?: () => void;
}
