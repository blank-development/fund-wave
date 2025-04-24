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

describe("Statistics", () => {
  beforeEach(() => {
    clearStore();
  });

  afterEach(() => {
    clearStore();
  });

  test("Statistics are initialized correctly", () => {
    const statistics = getOrCreateStatistics();
    assert.bigIntEquals(BigInt.fromI32(0), statistics.totalRaised);
    assert.i32Equals(0, statistics.totalBackers);
    assert.bigIntEquals(BigInt.fromI32(0), statistics.averageContribution);
    assert.i32Equals(0, statistics.activeCampaigns);
    assert.i32Equals(0, statistics.successfulCampaigns);
    assert.i32Equals(0, statistics.totalCampaigns);
    assert.stringEquals("0", statistics.successRate.toString());
  });

  test("Statistics are updated when campaign is created", () => {
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

    const statistics = getOrCreateStatistics();
    assert.i32Equals(1, statistics.totalCampaigns);
    assert.i32Equals(1, statistics.activeCampaigns);
    assert.i32Equals(0, statistics.successfulCampaigns);
    assert.stringEquals("0", statistics.successRate.toString());
  });

  test("Statistics are updated when contribution is made", () => {
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

    const statistics = getOrCreateStatistics();
    assert.bigIntEquals(amount, statistics.totalRaised);
    assert.i32Equals(1, statistics.totalBackers);
    assert.bigIntEquals(amount, statistics.averageContribution);
  });

  test("Statistics are updated when campaign status changes", () => {
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

    const statusEvent = createCampaignEndedEvent(
      campaignId.toHexString(),
      BigInt.fromI32(100)
    );
    handleCampaignStatusChanged(statusEvent);

    const statistics = getOrCreateStatistics();
    assert.i32Equals(0, statistics.activeCampaigns);
    assert.i32Equals(1, statistics.successfulCampaigns);
    assert.stringEquals("1", statistics.successRate.toString());
  });

  test("Multiple contributions update statistics correctly", () => {
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

    const contributor1 = Bytes.fromHexString(
      "0x0000000000000000000000000000000000005678"
    );
    const amount1 = BigInt.fromI32(100);
    const contributionEvent1 = createContributionMadeEvent(
      campaignId.toHexString(),
      contributor1.toHexString(),
      amount1.toString()
    );
    handleContributionMade(contributionEvent1);

    const contributor2 = Bytes.fromHexString(
      "0x0000000000000000000000000000000000009abc"
    );
    const amount2 = BigInt.fromI32(200);
    const contributionEvent2 = createContributionMadeEvent(
      campaignId.toHexString(),
      contributor2.toHexString(),
      amount2.toString()
    );
    handleContributionMade(contributionEvent2);

    const statistics = getOrCreateStatistics();
    assert.bigIntEquals(amount1.plus(amount2), statistics.totalRaised);
    assert.i32Equals(2, statistics.totalBackers);
    assert.bigIntEquals(
      amount1.plus(amount2).div(BigInt.fromI32(2)),
      statistics.averageContribution
    );
  });
});
