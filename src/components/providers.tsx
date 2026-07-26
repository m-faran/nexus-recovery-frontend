"use client";

import "@rainbow-me/rainbowkit/styles.css";

import { WagmiConfig } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, lightTheme, darkTheme } from "@rainbow-me/rainbowkit";
import { useState, type ReactNode } from "react";
import { wagmiConfig } from "@/lib/wagmi";
import { fuji } from "@/lib/chains";

const rainbowKitTheme = {
  lightMode: lightTheme({
    accentColor: "#1d4f8c",
    accentColorForeground: "#f6f9fc",
    borderRadius: "medium",
    fontStack: "system",
  }),
  darkMode: darkTheme({
    accentColor: "#4f8cc7",
    accentColorForeground: "#071b35",
    borderRadius: "medium",
    fontStack: "system",
  }),
};

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={rainbowKitTheme}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}
