"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

// Validation schema
const RegisterSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, "First name is too short")
    .max(50, "First name is too long")
    .required("First name is required"),
  lastName: Yup.string()
    .min(2, "Last name is too short")
    .max(50, "Last name is too long")
    .required("Last name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[!@#$%^&*]/,
      "Password must contain at least one special character"
    )
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
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
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          walletAddress: address,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong");
      }

      toast({
        title: "Success",
        description: "Account created successfully!",
      });

      router.push("/login");
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
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="h-16 border-b border-gray-800 flex items-center px-6">
        <Link
          href="/"
          className="flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
      </div>

      <div className="flex-1 flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black">
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
                Join FundWave
              </h1>
              <p className="text-gray-400 mb-8">
                Create an account to launch your campaign or support innovative
                projects.
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
                  Please connect your wallet to create an account
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
                  firstName: "",
                  lastName: "",
                  email: "",
                  password: "",
                  confirmPassword: "",
                  terms: false,
                }}
                validationSchema={RegisterSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First name</Label>
                        <Field
                          as={Input}
                          id="firstName"
                          name="firstName"
                          placeholder="John"
                          className="bg-gray-900 border-gray-800 focus:border-gray-700 text-white placeholder:text-gray-500"
                        />
                        <ErrorMessage
                          name="firstName"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last name</Label>
                        <Field
                          as={Input}
                          id="lastName"
                          name="lastName"
                          placeholder="Doe"
                          className="bg-gray-900 border-gray-800 focus:border-gray-700 text-white placeholder:text-gray-500"
                        />
                        <ErrorMessage
                          name="lastName"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Field
                        as={Input}
                        id="email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        className="bg-gray-900 border-gray-800 focus:border-gray-700 text-white placeholder:text-gray-500"
                      />
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Field
                        as={Input}
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        className="bg-gray-900 border-gray-800 focus:border-gray-700 text-white placeholder:text-gray-500"
                      />
                      <ErrorMessage
                        name="password"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                      <p className="text-xs text-gray-500">
                        Must be at least 8 characters and include a number and a
                        special character.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Field
                        as={Input}
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        className="bg-gray-900 border-gray-800 focus:border-gray-700 text-white placeholder:text-gray-500"
                      />
                      <ErrorMessage
                        name="confirmPassword"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-white text-black hover:bg-gray-200"
                      disabled={isLoading || isSubmitting}
                    >
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>

                    <div className="relative my-8">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-800"></div>
                      </div>
                    </div>

                    <p className="text-center text-sm text-gray-400 mt-8">
                      Already have an account?{" "}
                      <Link
                        href="/login"
                        className="text-white hover:underline"
                      >
                        Log in
                      </Link>
                    </p>
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
