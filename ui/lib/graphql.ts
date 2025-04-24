import { GraphQLClient } from "graphql-request";

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
