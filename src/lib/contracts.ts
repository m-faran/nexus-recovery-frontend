import nexusRecoveryJson from "../../nexusrecoveryabi.json";
import nexusRecoveryVaultJson from "../../nexusrecoveryvaultabi.json";
import type { Address } from "viem";

export const NEXUS_RECOVERY_ADDRESS = (process.env
  .NEXT_PUBLIC_NEXUS_RECOVERY_ADDRESS ?? "") as Address;

export const NEXUS_RECOVERY_VAULT_ADDRESS = (process.env
  .NEXT_PUBLIC_NEXUS_RECOVERY_VAULT_ADDRESS ?? "") as Address;

export const nexusRecoveryAbi = (nexusRecoveryJson as any).abi ?? (nexusRecoveryJson as any);
export const nexusRecoveryVaultAbi = (nexusRecoveryVaultJson as any).abi ?? (nexusRecoveryVaultJson as any);

export enum ClaimState {
  None = 0,
  Pending = 1,
  Executed = 2,
  Cancelled = 3,
}

export const MAX_HEIRS = 10;
export const BASIS_POINTS = 10000;

export const CLAIM_STATE_LABELS: Record<ClaimState, string> = {
  [ClaimState.None]: "None",
  [ClaimState.Pending]: "Pending",
  [ClaimState.Executed]: "Executed",
  [ClaimState.Cancelled]: "Cancelled",
};

export type RecoveryConfig = {
  owner: Address;
  heirs: readonly Address[];
  splits: readonly number[];
  inactivityPeriod: bigint;
  gracePeriod: bigint;
  lastProofOfLife: bigint;
  claimState: ClaimState;
  claimInitiatedAt: bigint;
  claimInitiator: Address;
};

export type RegisteredToken = {
  tokenAddress: Address;
  amount: bigint;
};
