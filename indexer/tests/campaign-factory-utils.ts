import { newMockEvent } from "matchstick-as";
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts";
import { CampaignCreated } from "../generated/CampaignFactory/CampaignFactory";

export function createCampaignCreatedEvent(
  campaign: Address,
  owner: Address,
  goal: BigInt,
  duration: BigInt
): CampaignCreated {
  let mockEvent = newMockEvent();

  let campaignCreatedEvent = new CampaignCreated(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt
  );

  campaignCreatedEvent.parameters = new Array();
  let campaignParam = new ethereum.EventParam(
    "campaign",
    ethereum.Value.fromAddress(campaign)
  );
  let ownerParam = new ethereum.EventParam(
    "owner",
    ethereum.Value.fromAddress(owner)
  );
  let goalParam = new ethereum.EventParam(
    "goal",
    ethereum.Value.fromUnsignedBigInt(goal)
  );
  let durationParam = new ethereum.EventParam(
    "duration",
    ethereum.Value.fromUnsignedBigInt(duration)
  );

  campaignCreatedEvent.parameters.push(campaignParam);
  campaignCreatedEvent.parameters.push(ownerParam);
  campaignCreatedEvent.parameters.push(goalParam);
  campaignCreatedEvent.parameters.push(durationParam);

  return campaignCreatedEvent;
}
