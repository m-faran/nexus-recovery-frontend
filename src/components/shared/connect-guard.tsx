"use client";

import React from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function ConnectGuard({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();

  if (!isConnected)
    return (
      <div className="card-surface rounded-xl border border-border bg-card p-8 text-center">
        <p className="mb-4 text-muted-foreground">Please connect your wallet to continue.</p>
        <div className="flex justify-center">
          <ConnectButton />
        </div>
      </div>
    );

  return <>{children}</>;
}
