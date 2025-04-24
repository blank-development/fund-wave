import { CampaignCreated as CampaignCreatedEvent } from "../generated/CampaignFactory/CampaignFactory";
import { CampaignCreated, Campaign } from "../generated/schema";
import { Campaign as CampaignTemplate } from "../generated/templates";
import { BigInt, Bytes } from "@graphprotocol/graph-ts";

export function handleCampaignCreated(event: CampaignCreatedEvent): void {
  let entity = new CampaignCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.campaign = event.params.campaign;
  entity.owner = event.params.owner;
  entity.goal = event.params.goal;
  entity.duration = event.params.duration;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();

  // Create a new Campaign entity
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

  // Create a new data source for the Campaign contract
  CampaignTemplate.create(event.params.campaign);
}
