import { GraphQLClient } from "graphql-request";
import { formatUnits } from "viem";

const SUBGRAPH_URL =
  process.env.NEXT_PUBLIC_SUBGRAPH_URL ||
  "https://api.thegraph.com/subgraphs/name/your-subgraph-name";

export const graphqlClient = new GraphQLClient(SUBGRAPH_URL);

export interface CampaignData {
  id: string;
  owner: string;
  goal: string;
  raised: string;
  deadline: string;
  token: string;
  contributions: {
    id: string;
    contributor: string;
    amount: string;
  }[];
  comments: {
    id: string;
    nullifier: string;
    comment: string;
  }[];
}

export const GET_CAMPAIGN_QUERY = `
  query GetCampaign($id: ID!) {
    campaign(id: $id) {
      id
      creator
      goal
      raised
      deadline
      token
      contributions {
        id
        contributor
        amount
      }
    }
  }
`;

export const GET_CONTRIBUTIONS_QUERY = `
  query GetContributions($id: ID!) {
    contributions(where: { campaign: $id }) {
      amount
    }
  }
`;

export const GET_ALL_CONTRIBUTIONS_QUERY = `
  query GetAllContributions {
    contributions {
      amount
    }
  }
`;

export async function getCampaignData(
  campaignId: string
): Promise<CampaignData | null> {
  try {
    const data = await graphqlClient.request(GET_CAMPAIGN_QUERY, {
      id: campaignId,
    });
    return data.campaign;
  } catch (error) {
    console.error("Error fetching campaign data:", error);
    return null;
  }
}

export async function getContributions(campaignId: string): Promise<number> {
  try {
    const data = await graphqlClient.request(GET_CONTRIBUTIONS_QUERY, {
      id: campaignId,
    });
    const totalRaised = data.contributions.reduce(
      (sum: number, contribution: any) => sum + Number(contribution.amount),
      0
    );

    return {
      totalRaised: formatUnits(totalRaised, 6),
      backers: data.contributions.length,
    };
  } catch (error) {
    console.error("Error fetching contributions:", error);
    return 0;
  }
}

export async function getAllContributions(): Promise<{
  totalRaised: string;
  totalBackers: number;
}> {
  try {
    const data = await graphqlClient.request(GET_ALL_CONTRIBUTIONS_QUERY);

    const totalRaised = data.contributions.reduce(
      (sum: number, contribution: any) => sum + Number(contribution.amount),
      0
    );

    return {
      totalRaised: formatUnits(totalRaised, 6),
      totalBackers: data.contributions.length,
    };
  } catch (error) {
    console.error("Error fetching all contributions:", error);
    return 0;
  }
}
