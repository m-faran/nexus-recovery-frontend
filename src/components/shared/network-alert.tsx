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
    <div className="flex flex-col gap-3 rounded-lg border border-white/15 bg-white/5 p-3 text-sm text-(--header-foreground) sm:flex-row sm:items-center sm:justify-between">
      <p>Please switch your wallet to Avalanche Fuji testnet to interact with Nexus Recovery.</p>
      {switchChain ? (
        <Button type="button" size="sm" variant="secondary" onClick={() => switchChain({ chainId: FUJI_CHAIN_ID })}>
          Switch to Fuji
        </Button>
      ) : (
        <p className="text-sm text-(--header-muted)">Chain switching unavailable in this wallet.</p>
      )}
    </div>
  );
}

export function useIsReady() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  return Boolean(isConnected && chainId === FUJI_CHAIN_ID);
}
