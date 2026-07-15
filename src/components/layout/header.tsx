"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { NetworkAlert } from "@/components/shared/network-alert";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-slate-50/90 backdrop-blur-sm dark:bg-slate-950/85">
      <div className="app-container flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Nexus Recovery
          </Link>
          <nav className="hidden items-center gap-6 text-sm sm:flex">
            <Link href="/owner" className="text-slate-600 hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-300">
              Owner Dashboard
            </Link>
            <Link href="/heir" className="text-slate-600 hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-300">
              Heir Portal
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ConnectButton showBalance={false} chainStatus="icon" />
        </div>
      </div>
      <div className="app-container pb-3">
        <NetworkAlert />
      </div>
    </header>
  );
}
