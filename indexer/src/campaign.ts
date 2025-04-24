import { Campaign, Contribution, AnonymousComment } from "../generated/schema";
import {
  ContributionMade as ContributionMadeEvent,
  CampaignEnded as CampaignEndedEvent,
  FundsWithdrawn as FundsWithdrawnEvent,
  AnonymousCommentSubmitted as AnonymousCommentSubmittedEvent,
} from "../generated/templates/Campaign/Campaign";
import { Bytes } from "@graphprotocol/graph-ts";
import { handleContributionMade as handleStatsContributionMade } from "./statistics";

export function handleContributionMade(event: ContributionMadeEvent): void {
  let campaign = Campaign.load(event.address);
  if (campaign == null) return;

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
  campaign.save();

  handleStatsContributionMade(event.address);
}

export function handleCampaignEnded(event: CampaignEndedEvent): void {
  let campaign = Campaign.load(event.address);
  if (campaign == null) return;
  campaign.status = "SUCCESSFUL";
  campaign.save();
}

export function handleFundsWithdrawn(event: FundsWithdrawnEvent): void {
  let campaign = Campaign.load(event.address);
  if (campaign == null) return;
  campaign.save();
}

export function handleAnonymousCommentSubmitted(
  event: AnonymousCommentSubmittedEvent
): void {
  let campaign = Campaign.load(event.address);
  if (campaign == null) return;

  let comment = new AnonymousComment(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  comment.campaign = campaign.id;
  comment.nullifier = event.params.nullifier;
  comment.comment = event.params.comment;
  comment.blockNumber = event.block.number;
  comment.blockTimestamp = event.block.timestamp;
  comment.transactionHash = event.transaction.hash;
  comment.save();
}
