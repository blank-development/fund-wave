"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useCampaignCreation } from "@/hooks/useCampaignCreation";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Validation schema
const CampaignSchema = Yup.object().shape({
  title: Yup.string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be less than 100 characters")
    .required("Title is required"),
  category: Yup.string().required("Category is required"),
  description: Yup.string()
    .min(100, "Description must be at least 100 characters")
    .max(5000, "Description must be less than 5000 characters")
    .required("Description is required"),
  goal: Yup.number()
    .min(100, "Goal must be at least $100")
    .required("Goal amount is required"),
  daysLeft: Yup.number()
    .min(1, "Campaign must last at least 1 day")
    .max(60, "Campaign cannot last more than 60 days")
    .required("Campaign duration is required"),
  image: Yup.mixed().required("Campaign image is required"),
});

const categories = [
  "Technology",
  "Art",
  "Music",
  "Film",
  "Games",
  "Publishing",
  "Food",
  "Fashion",
  "Sports",
  "Other",
];

export default function StartCampaignForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isRephrasing, setIsRephrasing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { createCampaign, error: campaignError } = useCampaignCreation();
  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();

  const handleConnectWallet = () => {
    connect({ connector: injected() });
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    if (!isConnected) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // First upload the image
      const imageFormData = new FormData();
      imageFormData.append("image", values.image);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: imageFormData,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.error || "Failed to upload image");
      }

      const { url: imageUrl } = await uploadResponse.json();

      // Create campaign using the hook
      const campaign = await createCampaign(
        BigInt(values.goal),
        values.daysLeft,
        process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "",
        values.title,
        values.description,
        values.category,
        imageUrl
      );

      toast({
        title: "Success",
        description: "Campaign created successfully!",
      });

      router.push(`/campaign/${campaign.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  const handleRephrase = async (
    description: string,
    setFieldValue: (field: string, value: any) => void
  ) => {
    setIsRephrasing(true);
    try {
      const response = await fetch("/api/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to rephrase description");
      }

      setFieldValue("description", data.rephrasedDescription);
      toast({
        title: "Success",
        description: "Description rephrased successfully!",
      });
    } catch (error) {
      console.error("Rephrase error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to rephrase description",
        variant: "destructive",
      });
    } finally {
      setIsRephrasing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="h-16 border-b border-gray-800 flex items-center px-6">
        <Link
          href="/"
          className="flex items-center text-black hover:text-white transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
      </div>

      <div className="flex-1 flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black to-black">
            <div className="absolute inset-0 opacity-20">
              {/* Grid pattern */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(#ffffff22 1px, transparent 1px), linear-gradient(to right, #ffffff22 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />
            </div>
          </div>

          <div className="relative z-10 h-full flex flex-col justify-center items-center p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center max-w-md"
            >
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Start Your Campaign
              </h1>
              <p className="text-white mb-8">
                Create a compelling campaign to bring your vision to life.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full max-w-md"
          >
            {!isConnected ? (
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold">Connect Your Wallet</h2>
                <p className="text-gray-400">
                  Please connect your wallet to create a campaign
                </p>
                <Button
                  onClick={handleConnectWallet}
                  disabled={isPending}
                  className="w-full bg-white text-black hover:bg-gray-200"
                >
                  {isPending ? "Connecting..." : "Connect Wallet"}
                </Button>
              </div>
            ) : (
              <Formik
                initialValues={{
                  title: "",
                  category: "",
                  description: "",
                  goal: "",
                  daysLeft: "",
                  image: null,
                }}
                validationSchema={CampaignSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, errors, touched, setFieldValue, values }) => (
                  <Form className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Campaign Title</Label>
                      <Field
                        as={Input}
                        id="title"
                        name="title"
                        placeholder="Enter your campaign title"
                        className="bg-white border-gray-800 focus:border-gray-700 text-black placeholder:text-gray-500"
                      />
                      <ErrorMessage
                        name="title"
                        component="div"
                        className="text-white text-sm mt-1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Field name="category">
                        {({ field, form }: any) => (
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              form.setFieldValue("category", value);
                            }}
                          >
                            <SelectTrigger className="bg-white border-gray-800 focus:border-gray-700 text-black">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </Field>
                      <ErrorMessage
                        name="category"
                        component="div"
                        className="text-white text-sm mt-1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <div className="relative">
                        <Field
                          as={Textarea}
                          id="description"
                          name="description"
                          placeholder="Describe your campaign in detail..."
                          className="bg-white border-gray-800 focus:border-gray-700 text-black placeholder:text-gray-500 min-h-[200px] pr-12"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleRephrase(values.description, setFieldValue)
                          }
                          disabled={isRephrasing || !values.description}
                          className="absolute right-2 top-2 p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Rephrase description"
                        >
                          <Wand2 className="w-5 h-5 text-black" />
                        </button>
                      </div>
                      <ErrorMessage
                        name="description"
                        component="div"
                        className="text-white text-sm mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="goal">Funding Goal ($)</Label>
                        <Field
                          as={Input}
                          id="goal"
                          name="goal"
                          type="number"
                          placeholder="1000"
                          className="bg-white border-gray-800 focus:border-gray-700 text-black placeholder:text-gray-500"
                        />
                        <ErrorMessage
                          name="goal"
                          component="div"
                          className="text-white text-sm mt-1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="daysLeft">
                          Campaign Duration (days)
                        </Label>
                        <Field
                          as={Input}
                          id="daysLeft"
                          name="daysLeft"
                          type="number"
                          placeholder="30"
                          className="bg-white border-gray-800 focus:border-gray-700 text-black placeholder:text-gray-500"
                        />
                        <ErrorMessage
                          name="daysLeft"
                          component="div"
                          className="text-white text-sm mt-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image">Campaign Image</Label>
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor="image"
                          className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-800 border-dashed rounded-lg cursor-pointer bg-white relative"
                        >
                          {imagePreview ? (
                            <>
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-full object-cover rounded-lg"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0">
                                <p className="text-white text-sm">
                                  Click to change image
                                </p>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-4 text-black" />
                              <p className="mb-2 text-sm text-black">
                                <span className="font-semibold">
                                  Click to upload
                                </span>{" "}
                                or drag and drop
                              </p>
                              <p className="text-xs text-black">
                                PNG, JPG or GIF (MAX. 10MB)
                              </p>
                            </div>
                          )}
                          <input
                            id="image"
                            type="file"
                            className="hidden bg-white"
                            accept="image/*"
                            onChange={(event) => {
                              const file = event.currentTarget.files?.[0];
                              if (file) {
                                setFieldValue("image", file);
                                // Create preview URL
                                const previewUrl = URL.createObjectURL(file);
                                setImagePreview(previewUrl);
                              }
                            }}
                          />
                        </label>
                      </div>
                      <ErrorMessage
                        name="image"
                        component="div"
                        className="text-white text-sm mt-1"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-white text-black hover:bg-white hover:text-black"
                      disabled={isLoading || isSubmitting}
                    >
                      {isLoading ? "Creating campaign..." : "Create Campaign"}
                    </Button>
                  </Form>
                )}
              </Formik>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
