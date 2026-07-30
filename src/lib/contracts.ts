import nexusRecoveryJson from "../../nexusrecoveryabi.json";
import type { Address } from "viem";

export const NEXUS_RECOVERY_ADDRESS = (process.env
  .NEXT_PUBLIC_NEXUS_RECOVERY_ADDRESS ?? "") as Address;

export const nexusRecoveryAbi = (nexusRecoveryJson as any).abi ?? (nexusRecoveryJson as any);

export enum ClaimState {
  None = 0,
  Pending = 1,
}

export type RecoveryConfig = {
  owner: Address;
  heirs: readonly Address[];
  splits: readonly number[];
  inactivityPeriod: bigint;
  gracePeriod: bigint;
  lastProofOfLife: bigint;
  claimInitiatedAt: bigint;
  claimInitiator: Address;
};

export type RegisteredToken = {
  tokenAddress: Address;
  amount: bigint;
};
