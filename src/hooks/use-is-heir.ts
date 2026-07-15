"use client";

import { useMemo } from "react";
import type { Address } from "viem";
import { useReadContract } from "wagmi";
import { nexusRecoveryAbi } from "@/lib/abis/nexusRecovery";
import { NEXUS_RECOVERY_ADDRESS } from "@/lib/contracts";

export function useIsHeir(owner?: Address, candidate?: Address) {
  const { data, isLoading, refetch } = useReadContract({
    address: NEXUS_RECOVERY_ADDRESS,
    abi: nexusRecoveryAbi,
    functionName: "getHeirs",
    args: owner ? [owner] : undefined,
    query: { enabled: !!owner, refetchInterval: 30_000 },
  });

  const isHeir = useMemo(() => {
    if (!data || !candidate) return false;
    const [heirs] = data;
    return heirs.some((h) => h.toLowerCase() === candidate.toLowerCase());
  }, [data, candidate]);

  return { isHeir, heirs: data?.[0], splits: data?.[1], isLoading, refetch };
}
