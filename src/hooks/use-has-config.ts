"use client";

import { useContractRead } from "wagmi";
import { NEXUS_RECOVERY_ADDRESS, nexusRecoveryAbi } from "@/lib/contracts";

export function useHasConfig(owner?: `0x${string}` | undefined) {
  const { data, isError, isLoading } = useContractRead({
    address: NEXUS_RECOVERY_ADDRESS as any,
    abi: nexusRecoveryAbi as any,
    functionName: "hasConfig",
    args: owner ? [owner] : undefined,
    query: { enabled: !!owner, refetchInterval: 30_000 },
  });

  return { hasConfig: Boolean(data), isError, isLoading };
}
