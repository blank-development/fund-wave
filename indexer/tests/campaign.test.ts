import {
  assert,
  describe,
  test,
  clearStore,
  beforeEach,
  afterEach,
} from "matchstick-as/assembly/index";
import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  handleContributionMade,
  handleAnonymousCommentSubmitted,
} from "../src/campaign";
import {
  createContributionMadeEvent,
  createAnonymousCommentSubmittedEvent,
  createMockCampaign,
  createCampaignCreatedEvent,
  createCampaignStatusChangedEvent,
  createCampaignEndedEvent,
} from "./campaign-utils";
import {
  handleCampaignCreated,
  handleCampaignStatusChanged,
} from "../src/mappings/campaign";
import { getOrCreateStatistics } from "../src/statistics";

describe("Campaign", () => {
  beforeEach(() => {
    clearStore();
  });

  afterEach(() => {
    clearStore();
  });

  test("Campaign is created correctly", () => {
    const campaignId = Bytes.fromHexString(
      "0x000000000000000000000000000000000000abcd"
    );
    const creator = Bytes.fromHexString(
      "0x0000000000000000000000000000000000001234"
    );
    const goal = BigInt.fromI32(1000);
    const duration = BigInt.fromI32(30);

    const event = createCampaignCreatedEvent(
      campaignId.toHexString(),
      creator.toHexString(),
      goal.toString(),
      duration.toString()
    );
    handleCampaignCreated(event);

    assert.entityCount("Campaign", 1);
    assert.fieldEquals(
      "Campaign",
      campaignId.toHexString(),
      "creator",
      creator.toHexString()
    );
    assert.fieldEquals(
      "Campaign",
      campaignId.toHexString(),
      "goal",
      goal.toString()
    );
    assert.fieldEquals(
      "Campaign",
      campaignId.toHexString(),
      "status",
      "ACTIVE"
    );

    // Check statistics
    const statistics = getOrCreateStatistics();
    assert.i32Equals(1, statistics.totalCampaigns);
    assert.i32Equals(1, statistics.activeCampaigns);
  });

  test("Contribution is recorded correctly", () => {
    // First create a campaign
    const campaignId = Bytes.fromHexString(
      "0x000000000000000000000000000000000000abcd"
    );
    const creator = Bytes.fromHexString(
      "0x0000000000000000000000000000000000001234"
    );
    const goal = BigInt.fromI32(1000);
    const duration = BigInt.fromI32(30);
    const campaignEvent = createCampaignCreatedEvent(
      campaignId.toHexString(),
      creator.toHexString(),
      goal.toString(),
      duration.toString()
    );
    handleCampaignCreated(campaignEvent);

    // Then make a contribution
    const contributor = Bytes.fromHexString(
      "0x0000000000000000000000000000000000005678"
    );
    const amount = BigInt.fromI32(100);
    const contributionEvent = createContributionMadeEvent(
      campaignId.toHexString(),
      contributor.toHexString(),
      amount.toString()
    );
    handleContributionMade(contributionEvent);

    assert.entityCount("Contribution", 1);
    assert.fieldEquals(
      "Contribution",
      contributionEvent.transaction.hash.toHexString() +
        "-" +
        contributionEvent.logIndex.toString(),
      "amount",
      amount.toString()
    );
    assert.fieldEquals(
      "Contribution",
      contributionEvent.transaction.hash.toHexString() +
        "-" +
        contributionEvent.logIndex.toString(),
      "contributor",
      contributor.toHexString()
    );

    // Check campaign is updated
    assert.fieldEquals(
      "Campaign",
      campaignId.toHexString(),
      "raised",
      amount.toString()
    );
    assert.fieldEquals("Campaign", campaignId.toHexString(), "backers", "1");

    // Check statistics
    const statistics = getOrCreateStatistics();
    assert.bigIntEquals(amount, statistics.totalRaised);
    assert.i32Equals(1, statistics.totalBackers);
    assert.bigIntEquals(amount, statistics.averageContribution);
  });

  test("Campaign status is updated correctly", () => {
    // First create a campaign
    const campaignId = Bytes.fromHexString(
      "0x000000000000000000000000000000000000abcd"
    );
    const creator = Bytes.fromHexString(
      "0x0000000000000000000000000000000000001234"
    );
    const goal = BigInt.fromI32(1000);
    const duration = BigInt.fromI32(30);
    const campaignEvent = createCampaignCreatedEvent(
      campaignId.toHexString(),
      creator.toHexString(),
      goal.toString(),
      duration.toString()
    );
    handleCampaignCreated(campaignEvent);

    // Then change its status
    const statusEvent = createCampaignEndedEvent(
      campaignId.toHexString(),
      BigInt.fromI32(100)
    );
    handleCampaignStatusChanged(statusEvent);

    assert.fieldEquals(
      "Campaign",
      campaignId.toHexString(),
      "status",
      "SUCCESSFUL"
    );

    // Check statistics
    const statistics = getOrCreateStatistics();
    assert.i32Equals(0, statistics.activeCampaigns);
    assert.i32Equals(1, statistics.successfulCampaigns);
    assert.stringEquals("1", statistics.successRate.toString());
  });

  test("Contribution is properly indexed", () => {
    let campaignAddr = Bytes.fromHexString(
      "0x000000000000000000000000000000000000abcd"
    );
    let contributorAddr = Bytes.fromHexString(
      "0x0000000000000000000000000000000000001234"
    );

    createMockCampaign(campaignAddr.toHexString());

    let amount = BigInt.fromI32(100);
    let contributionEvent = createContributionMadeEvent(
      campaignAddr.toHexString(),
      contributorAddr.toHexString(),
      amount.toString()
    );

    handleContributionMade(contributionEvent);

    // Test Contribution entity
    assert.fieldEquals(
      "Contribution",
      contributionEvent.transaction.hash.toHexString() +
        "-" +
        contributionEvent.logIndex.toString(),
      "contributor",
      contributorAddr.toHexString()
    );
    assert.fieldEquals(
      "Contribution",
      contributionEvent.transaction.hash.toHexString() +
        "-" +
        contributionEvent.logIndex.toString(),
      "amount",
      amount.toString()
    );

    // Test Campaign raised amount is updated
    assert.fieldEquals(
      "Campaign",
      campaignAddr.toHexString(),
      "raised",
      amount.toString()
    );

    clearStore();
  });

  test("Anonymous comment is properly indexed", () => {
    let campaignAddr = Bytes.fromHexString(
      "0x000000000000000000000000000000000000abcd"
    );
    createMockCampaign(campaignAddr.toHexString());

    let nullifier = BigInt.fromI32(123);
    let comment = BigInt.fromI32(456);
    let commentEvent = createAnonymousCommentSubmittedEvent(
      campaignAddr,
      nullifier,
      comment
    );

    handleAnonymousCommentSubmitted(commentEvent);

    // Test AnonymousComment entity
    assert.fieldEquals(
      "AnonymousComment",
      commentEvent.transaction.hash.toHexString() + "-1",
      "nullifier",
      nullifier.toString()
    );
    assert.fieldEquals(
      "AnonymousComment",
      commentEvent.transaction.hash.toHexString() +
        "-" +
        commentEvent.logIndex.toString(),
      "comment",
      comment.toString()
    );

    clearStore();
  });
});
