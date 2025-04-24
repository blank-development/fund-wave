import { useState } from "react";
import { useCampaignContribution } from "@/hooks/useCampaignContribution";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ContributeFormProps {
  campaignAddress: string;
  onSuccess?: () => void;
}

export function ContributeForm({
  campaignAddress,
  onSuccess,
}: ContributeFormProps) {
  const { contributeToCampaign, isLoading, error } = useCampaignContribution();
  const [amount, setAmount] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await contributeToCampaign(
        campaignAddress,
        BigInt(parseFloat(amount) * 1e18) // Convert ETH to Wei
      );
      setAmount("");
      onSuccess?.();
    } catch (error) {
      console.error("Error contributing:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Contribution Amount (ETH)</Label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.1"
          required
          min="0.001"
          step="0.001"
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Contributing..." : "Contribute"}
      </Button>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </form>
  );
}
