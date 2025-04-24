import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

export interface PublicComment {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  created_at: string;
  reply_to?: string;
  user: {
    id: string;
    username: string;
    avatar_url: string;
  };
  reply_to_comment?: {
    id: string;
    content: string;
    user: {
      id: string;
      username: string;
      avatar_url: string;
    };
  };
}

export function usePublicComments(projectId: string) {
  const [comments, setComments] = useState<PublicComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/comments?projectId=${projectId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch comments");
        }

        setComments(data.comments);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch comments"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [projectId]);

  // Add a new comment
  const addComment = async (content: string, replyTo?: string) => {
    if (!address) throw new Error("Wallet not connected");

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          content,
          replyTo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add comment");
      }

      setComments((prev) => [data.comment, ...prev]);
      return data.comment;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add comment");
      throw err;
    }
  };

  return {
    comments,
    isLoading,
    error,
    addComment,
  };
}
