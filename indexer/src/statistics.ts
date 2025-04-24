import { BigInt, BigDecimal, Bytes } from "@graphprotocol/graph-ts";
import { Statistics, Campaign } from "../generated/schema";

const STATISTICS_ID = "platform-statistics";

export function getOrCreateStatistics(): Statistics {
  let statistics = Statistics.load(STATISTICS_ID);
  if (!statistics) {
    statistics = new Statistics(STATISTICS_ID);
    statistics.totalRaised = BigInt.fromI32(0);
    statistics.totalBackers = 0;
    statistics.averageContribution = BigInt.fromI32(0);
    statistics.activeCampaigns = 0;
    statistics.successfulCampaigns = 0;
    statistics.totalCampaigns = 0;
    statistics.successRate = BigDecimal.fromString("0");
    statistics.lastUpdated = BigInt.fromI32(0);
  }
  return statistics;
}

export function updateStatistics(campaignId: Bytes): void {
  let statistics = getOrCreateStatistics();

  // Reset counters
  statistics.totalRaised = BigInt.fromI32(0);
  statistics.totalBackers = 0;
  statistics.activeCampaigns = 0;
  statistics.successfulCampaigns = 0;
  statistics.totalCampaigns = 0;

  // Calculate statistics based on the campaign
  let campaign = Campaign.load(campaignId);
  if (campaign) {
    statistics.totalRaised = campaign.raised;
    statistics.totalBackers = campaign.backers;
    statistics.totalCampaigns = 1;

    if (campaign.status == "ACTIVE") {
      statistics.activeCampaigns = 1;
    } else if (campaign.status == "SUCCESSFUL") {
      statistics.successfulCampaigns = 1;
    }
  }

  // Calculate average contribution
  if (statistics.totalBackers > 0) {
    statistics.averageContribution = statistics.totalRaised.div(
      BigInt.fromI32(statistics.totalBackers)
    );
  }

  // Calculate success rate
  if (statistics.totalCampaigns > 0) {
    statistics.successRate = BigDecimal.fromString(
      statistics.successfulCampaigns.toString()
    ).div(BigDecimal.fromString(statistics.totalCampaigns.toString()));
  }

  statistics.lastUpdated = campaign
    ? campaign.blockTimestamp
    : BigInt.fromI32(0);
  statistics.save();
}

export function handleCampaignCreated(campaignId: Bytes): void {
  updateStatistics(campaignId);
}

export function handleContributionMade(campaignId: Bytes): void {
  updateStatistics(campaignId);
}

export function handleCampaignStatusChanged(campaignId: Bytes): void {
  updateStatistics(campaignId);
}
