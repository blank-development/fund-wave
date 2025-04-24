import { newMockEvent } from "matchstick-as";
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  ContributionMade,
  AnonymousCommentSubmitted,
  CampaignEnded,
} from "../generated/templates/Campaign/Campaign";
import { CampaignCreated } from "../generated/CampaignFactory/CampaignFactory";
import { Campaign } from "../generated/schema";

export function createCampaignCreatedEvent(
  campaign: string,
  owner: string,
  goal: string,
  duration: string,
  blockNumber: string = "1",
  blockTimestamp: string = "1",
  transactionHash: string = "0x1234567890123456789012345678901234567890123456789012345678901234"
): CampaignCreated {
  let mockEvent = changetype<CampaignCreated>(newMockEvent());
  mockEvent.parameters = new Array();

  mockEvent.parameters.push(
    new ethereum.EventParam(
      "campaign",
      ethereum.Value.fromAddress(Address.fromString(campaign))
    )
  );
  mockEvent.parameters.push(
    new ethereum.EventParam(
      "owner",
      ethereum.Value.fromAddress(Address.fromString(owner))
    )
  );
  mockEvent.parameters.push(
    new ethereum.EventParam(
      "goal",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString(goal))
    )
  );
  mockEvent.parameters.push(
    new ethereum.EventParam(
      "duration",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString(duration))
    )
  );

  mockEvent.block.number = BigInt.fromString(blockNumber);
  mockEvent.block.timestamp = BigInt.fromString(blockTimestamp);
  mockEvent.transaction.hash = Bytes.fromHexString(transactionHash);
  return mockEvent;
}

export function createContributionMadeEvent(
  campaignId: string,
  contributor: string,
  amount: string
): ContributionMade {
  let mockEvent = newMockEvent();
  mockEvent.address = Address.fromString(campaignId);
  let event = new ContributionMade(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt
  );
  event.parameters = new Array();
  event.parameters.push(
    new ethereum.EventParam(
      "contributor",
      ethereum.Value.fromAddress(Address.fromString(contributor))
    )
  );
  event.parameters.push(
    new ethereum.EventParam(
      "amount",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString(amount))
    )
  );
  return event;
}

export function createCampaignStatusChangedEvent(
  campaignId: Bytes,
  totalRaised: BigInt
): CampaignEnded {
  let mockEvent = newMockEvent();
  mockEvent.address = Address.fromBytes(campaignId);
  let event = new CampaignEnded(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt
  );
  event.parameters = new Array();
  event.parameters.push(
    new ethereum.EventParam(
      "totalRaised",
      ethereum.Value.fromUnsignedBigInt(totalRaised)
    )
  );
  return event;
}

export function createMockCampaign(
  id: string,
  goal: string = "1000",
  deadline: string = "1000",
  token: string = "0x0000000000000000000000000000000000000000"
): void {
  let campaign = new Campaign(Address.fromString(id));
  campaign.creator = Address.fromString(id);
  campaign.goal = BigInt.fromString(goal);
  campaign.raised = BigInt.fromI32(0);
  campaign.deadline = BigInt.fromString(deadline);
  campaign.token = Address.fromString(token);
  campaign.status = "ACTIVE";
  campaign.backers = 0;
  campaign.blockNumber = BigInt.fromI32(1);
  campaign.blockTimestamp = BigInt.fromI32(1);
  campaign.transactionHash = Bytes.fromHexString(
    "0x1234567890123456789012345678901234567890123456789012345678901234"
  );
  campaign.save();
}

export function createAnonymousCommentSubmittedEvent(
  campaign: Bytes,
  nullifier: BigInt,
  comment: BigInt
): AnonymousCommentSubmitted {
  let mockEvent = newMockEvent();
  mockEvent.address = Address.fromBytes(campaign);
  mockEvent.transaction.hash = Bytes.fromHexString(
    "0xa16081f360e3847006db660bae1c6d1b2e17ec2a"
  );
  mockEvent.logIndex = BigInt.fromI32(1);

  let commentEvent = new AnonymousCommentSubmitted(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt
  );

  commentEvent.parameters = new Array();
  commentEvent.parameters.push(
    new ethereum.EventParam(
      "nullifier",
      ethereum.Value.fromUnsignedBigInt(nullifier)
    )
  );
  commentEvent.parameters.push(
    new ethereum.EventParam(
      "comment",
      ethereum.Value.fromUnsignedBigInt(comment)
    )
  );

  return commentEvent;
}

export function createCampaignEndedEvent(
  campaignId: string,
  totalRaised: BigInt
): CampaignEnded {
  let mockEvent = newMockEvent();
  mockEvent.address = Address.fromString(campaignId);
  let event = new CampaignEnded(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt
  );
  event.parameters = new Array();
  event.parameters.push(
    new ethereum.EventParam(
      "totalRaised",
      ethereum.Value.fromUnsignedBigInt(totalRaised)
    )
  );
  return event;
}
