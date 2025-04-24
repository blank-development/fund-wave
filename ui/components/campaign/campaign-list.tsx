import { useEffect, useState } from "react";
import { useCampaignInfo } from "@/hooks/useCampaignInfo";
import { CampaignData } from "@/lib/campaign";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatEther } from "ethers";

export function CampaignList() {
  const { getCampaigns, isLoading, error } = useCampaignInfo();
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const data = await getCampaigns();
        setCampaigns(data);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      }
    };

    fetchCampaigns();
  }, [getCampaigns]);

  if (isLoading) {
    return <div>Loading campaigns...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {campaigns.map((campaign) => (
        <Card key={campaign.id}>
          <CardHeader>
            <CardTitle>{campaign.title}</CardTitle>
            <CardDescription>{campaign.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Goal:</span>
                <span className="font-medium">
                  {formatEther(campaign.goal)} ETH
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Raised:</span>
                <span className="font-medium">
                  {formatEther(campaign.raised)} ETH
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Days Left:</span>
                <span className="font-medium">
                  {Math.ceil(
                    (Number(campaign.deadline) - Date.now() / 1000) /
                      (24 * 60 * 60)
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Category:</span>
                <Badge variant="secondary">{campaign.category}</Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <a href={`/campaigns/${campaign.id}`}>View Details</a>
            </Button>
            <Button asChild>
              <a href={`/campaigns/${campaign.id}/contribute`}>Contribute</a>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
