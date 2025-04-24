"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuthError() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Authentication Error</h1>
          <p className="text-gray-400">
            There was a problem with the server configuration
          </p>
        </div>

        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/login">Return to Login</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Go to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
