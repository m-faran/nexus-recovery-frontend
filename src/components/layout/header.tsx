"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount, useChainId } from "wagmi";
import { ShieldCheck } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { NetworkAlert } from "@/components/shared/network-alert";
import { FUJI_CHAIN_ID } from "@/lib/chains";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/owner", label: "Owner Dashboard" },
  { href: "/heir", label: "Heir Portal" },
];

export function Header() {
  const pathname = usePathname();
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const showNetworkAlert = isConnected && chainId !== FUJI_CHAIN_ID;

  return (
    <header className="sticky top-0 z-40 border-b border-(--header-border) bg-(--header-background) shadow-sm">
      <div className="app-container py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="group flex items-center gap-2.5 rounded-md px-1.5 py-1 outline-none focus-visible:bg-(--header-hover)"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-white transition-transform duration-200 ease-out group-hover:-translate-x-1 group-hover:scale-110">
                <ShieldCheck size={20} strokeWidth={2.25} />
              </span>
              <span className="inline-block text-lg font-bold tracking-tight text-(--header-foreground) transition-transform duration-200 ease-out group-hover:scale-110">
                Nexus Recovery
              </span>
            </Link>
            <nav className="hidden items-center gap-1 text-sm sm:flex">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "rounded-md px-3 py-2 font-semibold outline-none transition-colors duration-150",
                      isActive
                        ? "bg-(--header-active) text-white"
                        : "text-(--header-muted) hover:bg-(--header-hover) hover:text-(--header-foreground) focus-visible:bg-(--header-active) focus-visible:text-white",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <ConnectButton showBalance={false} chainStatus="icon" />
          </div>
        </div>
        {showNetworkAlert ? (
          <div className="mt-3">
            <NetworkAlert />
          </div>
        ) : null}
      </div>
    </header>
  );
}
