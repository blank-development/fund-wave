"use client";

import { WagmiProvider, createConfig } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { injected } from "wagmi/connectors";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/components/ui/toast";

const config = createConfig({
  chains: [arbitrumSepolia],
  connectors: [injected()],
  transports: {
    [arbitrumSepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <SessionProvider>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </WagmiProvider>
      </SessionProvider>
    </ToastProvider>
  );
}
