"use client";

import { useEffect, useState } from "react";
import { useWatchContractEvent } from "wagmi";
import CampaignABI from "@/lib/contracts/Campaign.json";

interface Comment {
  nullifier: string;
  comment: string;
  timestamp: number;
}

interface CommentListProps {
  campaignAddress: string;
}

export function CommentList({ campaignAddress }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);

  // Listen for new anonymous comments
  useWatchContractEvent({
    address: campaignAddress as `0x${string}`,
    abi: CampaignABI,
    eventName: "AnonymousCommentSubmitted",
    onLogs(logs) {
      logs.forEach((log) => {
        const [nullifier, comment] = log.args;
        setComments((prev) => [
          ...prev,
          {
            nullifier: nullifier.toString(),
            comment: comment.toString(),
            timestamp: Date.now(),
          },
        ]);
      });
    },
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Anonymous Comments</h3>
      {comments.length === 0 ? (
        <p className="text-sm text-gray-500">No comments yet</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment, index) => (
            <div
              key={`${comment.nullifier}-${index}`}
              className="rounded-lg border p-4"
            >
              <p className="text-sm text-gray-500">
                Anonymous • {new Date(comment.timestamp).toLocaleString()}
              </p>
              <p className="mt-2">{comment.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
