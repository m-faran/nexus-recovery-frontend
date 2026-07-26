"use client";

import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { FUJI_CHAIN_ID } from "@/lib/chains";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRightLeft } from "lucide-react";

export function NetworkAlert() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  if (!isConnected || chainId === FUJI_CHAIN_ID) return null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-900 dark:border-amber-700/50 dark:bg-amber-900/20 dark:text-amber-200 sm:flex-row sm:items-center sm:justify-between backdrop-blur-sm">
      <div className="flex items-center gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
        <p className="font-medium">
          Wrong network — please switch to{" "}
          <span className="font-semibold">Avalanche Fuji Testnet</span> to use Nexus Recovery.
        </p>
      </div>
      {switchChain ? (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="gap-2 shrink-0 bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 dark:text-amber-200 dark:border-amber-700/50"
          onClick={() => switchChain({ chainId: FUJI_CHAIN_ID })}
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          Switch to Fuji
        </Button>
      ) : (
        <p className="text-xs text-amber-700/80 dark:text-amber-300/70 shrink-0">
          Chain switching unavailable in this wallet.
        </p>
      )}
    </div>
  );
}

export function useIsReady() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  return Boolean(isConnected && chainId === FUJI_CHAIN_ID);
}
