"use client";

import React from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Shield, Wallet } from "lucide-react";

export function ConnectGuard({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();

  if (!isConnected)
    return (
      <div className="flex items-center justify-center min-h-[60vh] py-10">
        <div className="relative card-surface glow-pulse max-w-sm w-full p-10 text-center space-y-6 overflow-hidden">
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gradient-to-br from-emerald-400/20 to-violet-500/20 blur-2xl dark:from-emerald-500/25 dark:to-violet-600/25" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-gradient-to-br from-violet-500/15 to-purple-600/15 blur-2xl" />

          {/* Icon */}
          <div className="relative mx-auto flex items-center justify-center w-18 h-18 w-[4.5rem] h-[4.5rem] rounded-2xl bg-gradient-to-br from-emerald-500 to-violet-600 shadow-xl shadow-emerald-500/35 dark:shadow-emerald-500/45">
            <Shield className="w-9 h-9 text-white" />
          </div>

          {/* Text */}
          <div className="relative space-y-2">
            <h2 className="text-xl font-extrabold tracking-tight gradient-text">
              Connect your wallet
            </h2>
            <p className="text-sm muted-text leading-relaxed">
              Connect your wallet to access Nexus Recovery and manage your on-chain asset protection plan.
            </p>
          </div>

          {/* Connect button */}
          <div className="relative flex justify-center">
            <ConnectButton
              label="Connect Wallet"
              showBalance={false}
              chainStatus="icon"
            />
          </div>

          {/* Security note */}
          <p className="relative text-xs muted-text flex items-center justify-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            Requires Avalanche Fuji Testnet
          </p>
        </div>
      </div>
    );

  return <>{children}</>;
}
