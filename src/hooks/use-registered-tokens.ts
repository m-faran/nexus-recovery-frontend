"use client";

import { useContractRead } from "wagmi";
import { NEXUS_RECOVERY_ADDRESS, nexusRecoveryAbi } from "@/lib/contracts";

export function useRegisteredTokens(owner?: `0x${string}`) {
  const { data, isLoading, isError } = useContractRead({
    address: NEXUS_RECOVERY_ADDRESS as any,
    abi: nexusRecoveryAbi as any,
    functionName: "getRegisteredTokens",
    args: owner ? [owner] : undefined,
    query: { enabled: !!owner, refetchInterval: 30_000 },
  });

  return { tokens: data as any[] | undefined, isLoading, isError };
}
