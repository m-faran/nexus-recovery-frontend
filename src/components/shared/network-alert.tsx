"use client";

import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { FUJI_CHAIN_ID } from "@/lib/chains";
import { Button } from "@/components/ui/button";

export function NetworkAlert() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  if (!isConnected || chainId === FUJI_CHAIN_ID) return null;

  return (
    <div className="flex flex-col gap-3 rounded-md border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900 dark:border-sky-700 dark:bg-sky-900/20 dark:text-sky-100 sm:flex-row sm:items-center sm:justify-between">
      <p>Please switch your wallet to Avalanche Fuji testnet to interact with Nexus Recovery.</p>
      {switchChain ? (
        <Button type="button" size="sm" variant="secondary" onClick={() => switchChain({ chainId: FUJI_CHAIN_ID })}>
          Switch to Fuji
        </Button>
      ) : (
        <p className="text-sm text-sky-900/80 dark:text-sky-200/80">Chain switching unavailable in this wallet.</p>
      )}
    </div>
  );
}

export function useIsReady() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  return Boolean(isConnected && chainId === FUJI_CHAIN_ID);
}
