"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useSemaphore } from "@/hooks/useSemaphore";
import { Identity } from "@semaphore-protocol/identity";
import { Group } from "@semaphore-protocol/group";

interface AnonymousCommentProps {
  campaignAddress: string;
  groupId: number;
  identity: Identity;
  group: Group;
}

export function AnonymousComment({
  campaignAddress,
  groupId,
  identity,
  group,
}: AnonymousCommentProps) {
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  const { submitAnonymousComment, isSubmitting, isSubmitSuccess } =
    useSemaphore(campaignAddress);

  const handleSubmit = async () => {
    if (!comment) return;

    try {
      await submitAnonymousComment(identity, group, comment);
      setComment("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isSubmitSuccess) {
    toast({
      title: "Success",
      description: "Comment submitted successfully!",
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Anonymous Comment</label>
        <Input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Enter your comment"
          className="mt-1"
        />
      </div>
      <Button
        onClick={handleSubmit}
        disabled={!comment || isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Submitting..." : "Submit Comment"}
      </Button>
    </div>
  );
}
