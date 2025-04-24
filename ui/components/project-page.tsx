"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Share2, Heart, Flag, Send, X } from "lucide-react";
import { useAccount } from "wagmi";
import { parseUnits } from "viem";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { AnonymousComment } from "@/components/anonymous-comment";
import { CommentList } from "@/components/comment-list";
import { useSemaphoreIdentity } from "@/hooks/useSemaphoreIdentity";
import { usePublicComments } from "@/hooks/usePublicComments";
import { useCampaignInfo } from "@/hooks/useCampaignInfo";
import { useCampaignContribution } from "@/hooks/useCampaignContribution";
import { useTokenApproval } from "@/hooks/useTokenApproval";
import { useToast } from "@/hooks/use-toast";

// Contribution tiers
const contributionTiers = [
  {
    amount: 25,
    title: "Early Supporter",
    description: "Be among the first to receive our product when it launches.",
    delivery: "Estimated delivery: March 2024",
  },
  {
    amount: 50,
    title: "Premium Package",
    description:
      "Receive the product plus exclusive accessories and early access.",
    delivery: "Estimated delivery: February 2024",
  },
  {
    amount: 100,
    title: "Collector's Edition",
    description:
      "Limited edition version with special features and personalization.",
    delivery: "Estimated delivery: February 2024",
  },
];

export default function ProjectPage({ id }: { id: string }) {
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [commentText, setCommentText] = useState("");
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();
  const { toast } = useToast();

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch project");
      }
      const data = await response.json();
      setProject(data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to fetch project"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch project data
  useEffect(() => {
    fetchProject();
  }, [id]);

  // Initialize Semaphore identity and group
  const { identity, group, groupId } = useSemaphoreIdentity(project?.id);

  // Initialize public comments
  const {
    comments,
    isLoading: isLoadingComments,
    error: commentsError,
    addComment,
  } = usePublicComments(project?.id);

  // Initialize campaign contribution
  const { contributeToCampaign } = useCampaignContribution(project?.id);

  // Initialize token approval
  const { approveToken } = useTokenApproval(
    process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "",
    project?.campaignAddress || ""
  );

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await addComment(commentText);
      setCommentText("");
      toast({
        title: "Comment added",
        description: "Your comment has been successfully posted.",
      });
    } catch (error) {
      console.error("Failed to submit comment:", error);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleContribute = async () => {
    if (!address) {
      toast({
        title: "Error",
        description: "Please connect your wallet to contribute.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const amount = selectedTier
        ? contributionTiers[selectedTier].amount
        : Number(customAmount);

      const amountInWei = parseUnits(amount.toString(), 6);

      // First approve tokens if needed
      await approveToken(amountInWei);

      // Then contribute
      await contributeToCampaign(project?.campaignAddress || "", amountInWei);

      await fetchProject();
      setIsLoading(false);
      setShowContributeModal(false);
      toast({
        title: "Success",
        description: "Thank you for your contribution!",
      });
    } catch (error) {
      console.error("Failed to contribute:", error);
      toast({
        title: "Error",
        description: "Failed to process contribution. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading campaign...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="h-16 border-b border-gray-800 flex items-center px-6">
        <Link
          href="/browse-projects"
          className="flex items-center text-white hover:text-white transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to projects
        </Link>
      </header>

      <div className="container py-8 px-4">
        {isLoading ? (
          <div />
        ) : (
          <div className="max-w-5xl mx-auto">
            {/* Project Header */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {project.title}
              </h1>
              <p className="text-white text-lg mb-4">
                {project.description.split("\n\n")[0]}
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage
                      src={project.creator.image || "/placeholder.svg"}
                      alt={project.creator.name}
                    />
                    <AvatarFallback>
                      {project.creator.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">
                    By{" "}
                    <span className="text-white">{project.creator.name}</span>
                  </span>
                </div>
                <span className="text-white">•</span>
                <span className="text-sm text-white">{project.category}</span>
              </div>
            </div>

            {/* Project Image */}
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-8">
              <img
                src={project.imageUrl || "/placeholder.svg"}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Project Details */}
              <div className="md:col-span-2">
                <Tabs defaultValue="story" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-black text-white">
                    <TabsTrigger value="story">Story</TabsTrigger>
                    <TabsTrigger value="updates">
                      Updates ({project.updates.length})
                    </TabsTrigger>
                    <TabsTrigger value="comments">Comments</TabsTrigger>
                  </TabsList>
                  <TabsContent value="story" className="pt-6">
                    <div className="prose prose-invert max-w-none">
                      {project.description
                        .split("\n\n")
                        .map((paragraph, index) => (
                          <p key={index} className="mb-4 text-gray-300">
                            {paragraph}
                          </p>
                        ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="updates" className="pt-6">
                    {project.updates.length > 0 ? (
                      <div className="space-y-6">
                        {project.updates.map((update, index) => (
                          <div
                            key={index}
                            className="bg-gray-900 rounded-lg p-6"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold">{update.title}</h3>
                              <span className="text-xs text-gray-400">
                                {update.date}
                              </span>
                            </div>
                            <p className="text-gray-300">{update.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-white">
                        <p>No updates yet. Check back soon!</p>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="comments" className="pt-6">
                    <div className="space-y-8">
                      {/* Anonymous Comments Section */}
                      <div className="bg-white text-black rounded-lg p-6">
                        <h3 className="text-lg font-medium mb-4">
                          Anonymous Comments
                        </h3>
                        {address ? (
                          identity && group ? (
                            <AnonymousComment
                              campaignAddress={project.id}
                              groupId={groupId || 0}
                              identity={identity}
                              group={group}
                            />
                          ) : (
                            <p className="text-black">
                              Loading anonymous comment system...
                            </p>
                          )
                        ) : (
                          <p className="text-black">
                            Connect your wallet to post anonymous comments
                          </p>
                        )}
                        <CommentList campaignAddress={project.id} />
                      </div>

                      {/* Public Comments Section */}
                      <div>
                        <h3 className="text-lg font-medium mb-4">
                          Public Comments
                        </h3>
                        {address ? (
                          <form
                            onSubmit={handleSubmitComment}
                            className="space-y-4"
                          >
                            <Textarea
                              placeholder="Leave a comment..."
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              className="bg-white border-black text-black"
                            />
                            <Button
                              type="submit"
                              disabled={!commentText.trim()}
                            >
                              Post Comment
                            </Button>
                          </form>
                        ) : (
                          <p className="text-white text-center">
                            Connect your wallet to post comments
                          </p>
                        )}

                        <div className="mt-8 space-y-6">
                          {isLoadingComments ? (
                            <p className="text-white">Loading comments...</p>
                          ) : commentsError ? (
                            <p className="text-red-400">
                              Error loading comments: {commentsError}
                            </p>
                          ) : comments.length === 0 ? (
                            <p className="text-white">
                              No comments yet. Be the first to comment!
                            </p>
                          ) : (
                            comments.map((comment) => (
                              <div key={comment.id} className="flex space-x-4">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage
                                    src={
                                      comment.user_avatar || "/placeholder.svg"
                                    }
                                    alt={comment.user_name || "Anonymous"}
                                  />
                                  <AvatarFallback>
                                    {(comment.user_name || "A").charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium">
                                      {comment.user_name || "Anonymous"}
                                    </span>
                                    {comment.is_creator && (
                                      <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                                        Creator
                                      </span>
                                    )}
                                    <span className="text-sm text-gray-400">
                                      {new Date(
                                        comment.created_at
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-gray-300">
                                    {comment.content}
                                  </p>
                                  {comment.reply_to && (
                                    <p className="mt-1 text-sm text-gray-400">
                                      Replying to{" "}
                                      <span className="text-gray-300">
                                        {comment.reply_to}
                                      </span>
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              {console.log(project)}
              {/* Funding Status */}
              <div className="space-y-6">
                <div className="bg-white text-black rounded-lg p-6">
                  <div className="mb-2">
                    <span className="text-2xl font-bold">
                      ${project.raised.toLocaleString()}
                    </span>
                    <span className="text-black text-sm ml-2">
                      of ${project.goal.toLocaleString()} goal
                    </span>
                  </div>
                  <Progress
                    value={(project.raised / project.goal) * 100}
                    className="h-2 mb-4"
                  />
                  <div className="grid grid-cols-3 text-center">
                    <div>
                      <div className="text-xl font-bold">{project.backers}</div>
                      <div className="text-xs text-black">Backers</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold">
                        {Math.round(project.daysLeft / 86400)}
                      </div>
                      <div className="text-xs text-black">Days Left</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold">
                        {Math.round((project.raised / project.goal) * 100)}%
                      </div>
                      <div className="text-xs text-black">Funded</div>
                    </div>
                  </div>

                  <Button
                    className="w-full mt-6 bg-black text-white hover:bg-black hover:text-white"
                    onClick={() => setShowContributeModal(true)}
                  >
                    Back This Project
                  </Button>

                  <div className="flex justify-between mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-black hover:text-black hover:bg-white"
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-black hover:text-black hover:bg-white"
                    >
                      <Heart className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-black hover:text-black hover:bg-white"
                    >
                      <Flag className="h-4 w-4 mr-1" />
                      Report
                    </Button>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6">
                  <h3 className="font-medium mb-4 text-black">
                    About the Creator
                  </h3>
                  <div className="flex items-center mb-4">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage
                        src={project.creator.image || "/placeholder.svg"}
                        alt={project.creator.name}
                      />
                      <AvatarFallback>
                        {project.creator.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-black">
                      <div className="font-medium">{project.creator.name}</div>
                      <div className="text-sm text-black">
                        {project.creator.campaigns} campaigns ·{" "}
                        {project.creator.backedProjects} backed
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full bg-black text-white hover:bg-black hover:text-white"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Contact Creator
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contribute Modal */}
      <AnimatePresence>
        {showContributeModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-black rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">
                    Back this project
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowContributeModal(false)}
                    className="text-white hover:text-white hover:bg-black"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">
                      Select a contribution tier
                    </h3>
                    {contributionTiers.map((tier, index) => (
                      <div
                        key={index}
                        className={`p-4 border rounded-lg mb-3 cursor-pointer transition-colors ${
                          selectedTier === index
                            ? "border-white bg-gray-800"
                            : "border-gray-700 hover:border-gray-500"
                        }`}
                        onClick={() => {
                          setSelectedTier(index);
                          setCustomAmount("");
                        }}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{tier.title}</span>
                          <span className="text-lg">${tier.amount}</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">
                          {tier.description}
                        </p>
                        <p className="text-xs text-gray-500">{tier.delivery}</p>
                      </div>
                    ))}

                    <div
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedTier === null && customAmount
                          ? "border-white bg-gray-800"
                          : "border-gray-700 hover:border-gray-500"
                      }`}
                      onClick={() => setSelectedTier(null)}
                    >
                      <div className="font-medium mb-2">Custom amount</div>
                      <div className="flex items-center">
                        <span className="text-lg mr-2">$</span>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Enter amount"
                          value={customAmount}
                          onChange={(e) => {
                            setCustomAmount(e.target.value);
                            setSelectedTier(null);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-transparent border-gray-700"
                        />
                      </div>
                    </div>
                  </div>

                  {/* <div className="space-y-4">
                    <h3 className="font-medium">Payment information</h3>
                    <div className="space-y-2">
                      <Label htmlFor="card-name">Name on card</Label>
                      <Input
                        id="card-name"
                        placeholder="John Smith"
                        className="bg-black border-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="card-number">Card number</Label>
                      <Input
                        id="card-number"
                        placeholder="1234 5678 9012 3456"
                        className="bg-black border-gray-700"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry date</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          className="bg-black border-gray-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvc">CVC</Label>
                        <Input
                          id="cvc"
                          placeholder="123"
                          className="bg-black border-gray-700"
                        />
                      </div>
                    </div>
                  </div> */}

                  <Separator className="bg-gray-800" />

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Your contribution:</span>
                      <span className="font-medium">
                        $
                        {selectedTier !== null
                          ? contributionTiers[selectedTier].amount
                          : customAmount || "0"}
                      </span>
                    </div>

                    <Button
                      className="w-full bg-white text-black hover:bg-gray-200"
                      onClick={handleContribute}
                      disabled={selectedTier === null && !customAmount}
                    >
                      {isLoading ? "Contributing..." : "Complete Contribution"}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
