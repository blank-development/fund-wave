import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
} from "matchstick-as/assembly/index";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { handleCampaignCreated } from "../src/campaign-factory";
import { createCampaignCreatedEvent } from "./campaign-factory-utils";

describe("CampaignFactory", () => {
  beforeAll(() => {
    // Setup before tests
  });

  afterAll(() => {
    clearStore();
  });

  test("Campaign creation is properly indexed", () => {
    let campaignAddr = "0x0000000000000000000000000000000000000001";
    let ownerAddr = "0x0000000000000000000000000000000000000002";
    let goal = BigInt.fromI32(1000);
    let duration = BigInt.fromI32(86400); // 1 day in seconds

    let newCampaignEvent = createCampaignCreatedEvent(
      Address.fromString(campaignAddr),
      Address.fromString(ownerAddr),
      goal,
      duration
    );

    handleCampaignCreated(newCampaignEvent);

    // Test CampaignCreated entity
    assert.fieldEquals(
      "CampaignCreated",
      newCampaignEvent.transaction.hash
        .concatI32(newCampaignEvent.logIndex.toI32())
        .toHexString(),
      "campaign",
      campaignAddr
    );
    assert.fieldEquals(
      "CampaignCreated",
      newCampaignEvent.transaction.hash
        .concatI32(newCampaignEvent.logIndex.toI32())
        .toHexString(),
      "owner",
      ownerAddr
    );
    assert.fieldEquals(
      "CampaignCreated",
      newCampaignEvent.transaction.hash
        .concatI32(newCampaignEvent.logIndex.toI32())
        .toHexString(),
      "goal",
      goal.toString()
    );
    assert.fieldEquals(
      "CampaignCreated",
      newCampaignEvent.transaction.hash
        .concatI32(newCampaignEvent.logIndex.toI32())
        .toHexString(),
      "duration",
      duration.toString()
    );

    // Test Campaign entity
    assert.fieldEquals("Campaign", campaignAddr, "creator", ownerAddr);
    assert.fieldEquals("Campaign", campaignAddr, "goal", goal.toString());
    assert.fieldEquals("Campaign", campaignAddr, "raised", "0");

    clearStore();
  });
});
