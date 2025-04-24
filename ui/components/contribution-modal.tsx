"use client";

import type React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Validation schema
const ContributionSchema = Yup.object().shape({
  amount: Yup.number()
    .min(1, "Amount must be at least $1")
    .required("Amount is required"),
  name: Yup.string().required("Name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  message: Yup.string().max(500, "Message must be less than 500 characters"),
});

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  campaignTitle: string;
}

export default function ContributionModal({
  isOpen,
  onClose,
  campaignId,
  campaignTitle,
}: ContributionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/contributions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignId,
          amount: values.amount,
          name: values.name,
          email: values.email,
          message: values.message,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong");
      }

      toast({
        title: "Success",
        description: "Thank you for your contribution!",
      });

      onClose();
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-gray-900 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Support {campaignTitle}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <Formik
                initialValues={{
                  amount: "",
                  name: "",
                  email: "",
                  message: "",
                }}
                validationSchema={ContributionSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Contribution Amount ($)</Label>
                      <Field
                        as={Input}
                        id="amount"
                        name="amount"
                        type="number"
                        placeholder="Enter amount"
                        className="bg-gray-900 border-gray-800 focus:border-gray-700 text-white placeholder:text-gray-500"
                      />
                      <ErrorMessage
                        name="amount"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Field
                        as={Input}
                        id="name"
                        name="name"
                        placeholder="John Doe"
                        className="bg-gray-900 border-gray-800 focus:border-gray-700 text-white placeholder:text-gray-500"
                      />
                      <ErrorMessage
                        name="name"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Field
                        as={Input}
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        className="bg-gray-900 border-gray-800 focus:border-gray-700 text-white placeholder:text-gray-500"
                      />
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message (Optional)</Label>
                      <Field
                        as="textarea"
                        id="message"
                        name="message"
                        placeholder="Leave a message for the campaign creator..."
                        className="w-full h-24 px-3 py-2 rounded-md bg-gray-900 border border-gray-800 focus:border-gray-700 text-white placeholder:text-gray-500 resize-none"
                      />
                      <ErrorMessage
                        name="message"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-white text-black hover:bg-gray-200"
                      disabled={isLoading || isSubmitting}
                    >
                      {isLoading ? "Processing..." : "Complete Contribution"}
                    </Button>
                  </Form>
                )}
              </Formik>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
