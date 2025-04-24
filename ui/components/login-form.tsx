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

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Validation schema
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong");
      }

      // Store token in localStorage
      localStorage.setItem("token", result.token);

      toast({
        title: "Success",
        description: "Logged in successfully!",
      });

      router.push("/dashboard");
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
                Welcome Back
              </h1>
              <p className="text-gray-400 mb-8">
                Log in to your account to manage your campaigns and connect with
                backers.
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
            <Formik
              initialValues={{
                email: "",
                password: "",
              }}
              validationSchema={LoginSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
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
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link
                        href="#"
                        className="text-sm text-gray-400 hover:text-white"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
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
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-white text-black hover:bg-gray-200"
                    disabled={isLoading || isSubmitting}
                  >
                    {isLoading ? "Logging in..." : "Log In"}
                  </Button>

                  <p className="text-center text-sm text-gray-400 mt-8">
                    Don't have an account?{" "}
                    <Link
                      href="/register"
                      className="text-white hover:underline"
                    >
                      Sign up
                    </Link>
                  </p>
                </Form>
              )}
            </Formik>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
