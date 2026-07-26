"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { NetworkAlert } from "@/components/shared/network-alert";
import { Shield } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-emerald-100/80 dark:border-emerald-900/30 bg-white/75 dark:bg-[#03080d]/80 backdrop-blur-xl">
      <div className="app-container flex items-center justify-between gap-4 py-3.5">
        {/* Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-violet-600 shadow-lg shadow-emerald-500/30 dark:shadow-emerald-500/40 group-hover:scale-105 group-hover:shadow-emerald-500/50 transition-all duration-200">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight gradient-text">
              Nexus Recovery
            </span>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            <Link
              href="/owner"
              className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition-all duration-150"
            >
              Owner Dashboard
            </Link>
            <Link
              href="/heir"
              className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-lg hover:bg-violet-50 hover:text-violet-700 dark:hover:bg-violet-950/40 dark:hover:text-violet-300 transition-all duration-150"
            >
              Heir Portal
            </Link>
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-700/50 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Fuji Testnet
          </span>
          <ConnectButton showBalance={false} chainStatus="icon" />
        </div>
      </div>

      {/* Network alert strip */}
      <div className="app-container pb-2.5">
        <NetworkAlert />
      </div>
    </header>
  );
}
