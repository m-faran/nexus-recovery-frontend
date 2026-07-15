"use client";

import React from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function ConnectGuard({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();

  if (!isConnected)
    return (
      <div className="rounded-md border p-6 text-center">
        <p className="mb-3">Please connect your wallet to continue.</p>
        <div className="flex justify-center">
          <ConnectButton />
        </div>
      </div>
    );

  return <>{children}</>;
}
