import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Campaign, Contribution } from "../../generated/schema";
import { CampaignCreated } from "../../generated/CampaignFactory/CampaignFactory";
import {
  ContributionMade,
  CampaignEnded,
} from "../../generated/templates/Campaign/Campaign";
import {
  handleCampaignCreated as handleStatsCampaignCreated,
  handleContributionMade as handleStatsContributionMade,
  handleCampaignStatusChanged as handleStatsCampaignStatusChanged,
} from "../statistics";

export function handleCampaignCreated(event: CampaignCreated): void {
  let campaign = new Campaign(event.params.campaign);
  campaign.creator = event.params.owner;
  campaign.goal = event.params.goal;
  campaign.raised = BigInt.fromI32(0);
  campaign.deadline = event.block.timestamp.plus(event.params.duration);
  campaign.token = Bytes.empty(); // This will be set when the campaign is initialized
  campaign.status = "ACTIVE";
  campaign.backers = 0;
  campaign.blockNumber = event.block.number;
  campaign.blockTimestamp = event.block.timestamp;
  campaign.transactionHash = event.transaction.hash;
  campaign.save();

  handleStatsCampaignCreated(event.params.campaign);
}

export function handleContributionMade(event: ContributionMade): void {
  let campaign = Campaign.load(event.address);
  if (!campaign) return;

  let contribution = new Contribution(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  contribution.campaign = campaign.id;
  contribution.contributor = event.params.contributor;
  contribution.amount = event.params.amount;
  contribution.blockNumber = event.block.number;
  contribution.blockTimestamp = event.block.timestamp;
  contribution.transactionHash = event.transaction.hash;
  contribution.save();

  campaign.raised = campaign.raised.plus(event.params.amount);
  campaign.backers = campaign.backers + 1;
  campaign.blockTimestamp = event.block.timestamp;
  campaign.save();

  handleStatsContributionMade(event.address);
}

export function handleCampaignStatusChanged(event: CampaignEnded): void {
  let campaign = Campaign.load(event.address);
  if (!campaign) return;

  campaign.status = "SUCCESSFUL";
  campaign.blockTimestamp = event.block.timestamp;
  campaign.save();

  handleStatsCampaignStatusChanged(event.address);
}
