"use client";

import { useContractRead } from "wagmi";
import { NEXUS_RECOVERY_ADDRESS, nexusRecoveryAbi, ClaimState, type RecoveryConfig } from "@/lib/contracts";
import { useMemo } from "react";

export function useClaimState(owner?: `0x${string}`) {
  const { data, isLoading, isError } = useContractRead({
    address: NEXUS_RECOVERY_ADDRESS as any,
    abi: nexusRecoveryAbi as any,
    functionName: "getClaimState",
    args: owner ? [owner] : undefined,
  });

  return { claimState: data as number | undefined, isLoading, isError };
}

export function useClaimActions(config?: RecoveryConfig) {
  return useMemo(() => {
    if (!config) {
      return {
        canInitiate: false,
        canExecute: false,
        inactivityTarget: BigInt(0),
        graceTarget: BigInt(0),
        inactivityElapsed: false,
        graceElapsed: false,
      };
    }

    const now = BigInt(Math.floor(Date.now() / 1000));
    const inactivityTarget = config.lastProofOfLife + config.inactivityPeriod;
    const graceTarget = config.claimInitiatedAt + config.gracePeriod;
    const inactivityElapsed = now >= inactivityTarget;
    const graceElapsed = now >= graceTarget;

    return {
      canInitiate:
        config.claimState === ClaimState.None && inactivityElapsed,
      canExecute:
        config.claimState === ClaimState.Pending && graceElapsed,
      inactivityTarget,
      graceTarget,
      inactivityElapsed,
      graceElapsed,
    };
  }, [config]);
}
