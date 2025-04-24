import { useState } from "react";
import { useAnonymousComment } from "@/hooks/useAnonymousComment";
import { useSemaphoreIdentity } from "@/hooks/useSemaphoreIdentity";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface AnonymousCommentFormProps {
  campaignAddress: string;
  onSuccess?: () => void;
}

export function AnonymousCommentForm({
  campaignAddress,
  onSuccess,
}: AnonymousCommentFormProps) {
  const { submitAnonymousComment, isLoading, error } = useAnonymousComment();
  const { identity, group } = useSemaphoreIdentity(campaignAddress);
  const [comment, setComment] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity || !group) return;

    try {
      await submitAnonymousComment(campaignAddress, comment, identity, group);
      setComment("");
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="comment">Anonymous Comment</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your anonymous comment..."
          required
          rows={3}
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading || !identity || !group}
        className="w-full"
      >
        {isLoading
          ? "Submitting..."
          : !identity || !group
          ? "Connecting..."
          : "Submit Comment"}
      </Button>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </form>
  );
}
