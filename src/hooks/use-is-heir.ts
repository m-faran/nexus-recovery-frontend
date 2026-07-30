"use client";

import { useMemo } from "react";
import type { Address } from "viem";
import { useReadContract } from "wagmi";
import { NEXUS_RECOVERY_ADDRESS, nexusRecoveryAbi } from "@/lib/contracts";

export function useIsHeir(owner?: Address, candidate?: Address) {
  const { data, isLoading, refetch } = useReadContract({
    address: NEXUS_RECOVERY_ADDRESS,
    abi: nexusRecoveryAbi as any,
    functionName: "getHeirs",
    args: owner ? [owner] : undefined,
    query: { enabled: !!owner, refetchInterval: 30_000 },
  });

  const isHeir = useMemo(() => {
    if (!data || !candidate) return false;
    const [heirs] = data as any;
    return heirs.some((h: string) => h.toLowerCase() === candidate.toLowerCase());
  }, [data, candidate]);

  return { isHeir, heirs: (data as any)?.[0], splits: (data as any)?.[1], isLoading, refetch };
}
