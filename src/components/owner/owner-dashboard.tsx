"use client";

import { useMemo } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useClaimActions } from "@/hooks/use-claim-actions";
import { useContractTx } from "@/hooks/use-contract-tx";
import { useHasConfig } from "@/hooks/use-has-config";
import { useRecoveryConfig } from "@/hooks/use-recovery-config";
import { useRegisteredTokens } from "@/hooks/use-registered-tokens";
import { useVaultBalance } from "@/hooks/use-vault-balance";
import { useCountdown } from "@/hooks/use-countdown";
import { RegisterRecoveryForm } from "@/components/owner/register-recovery-form";
import { DepositAvaxForm } from "@/components/owner/deposit-avax-form";
import { WithdrawAvaxForm } from "@/components/owner/withdraw-avax-form";
import { RegisterTokenForm } from "@/components/owner/register-token-form";
import { RegisteredTokensList } from "@/components/owner/registered-tokens-list";
import { CountdownDisplay } from "@/components/shared/countdown-display";
import { formatAvax, formatTimestamp, formatDuration, splitToPercent } from "@/lib/time";
import { ClaimState, NEXUS_RECOVERY_ADDRESS, nexusRecoveryAbi } from "@/lib/contracts";

export function OwnerDashboard() {
  const { address } = useAccount();
  const { hasConfig, isLoading: hasConfigLoading } = useHasConfig(address as any);
  const { config, isLoading: configLoading } = useRecoveryConfig(address as any);
  const { tokens, isLoading: tokensLoading } = useRegisteredTokens(address as any);
  const { balance, isLoading: balanceLoading } = useVaultBalance(address as any);
  const claimActions = useClaimActions(config);
  const { execute, isPending } = useContractTx();

  const claimState = useMemo(() => {
    if (!config) return ClaimState.None;
    return Number(config.claimState) as ClaimState;
  }, [config]);

  const inactivityCountdown = useCountdown(
    config ? config.lastProofOfLife + config.inactivityPeriod : undefined,
  );

  const graceCountdown = useCountdown(
    config && claimState === ClaimState.Pending
      ? config.claimInitiatedAt + config.gracePeriod
      : undefined,
  );

  const handleResetTimer = async () => {
    try {
      await execute(
        {
          address: NEXUS_RECOVERY_ADDRESS as any,
          abi: nexusRecoveryAbi as any,
          functionName: "resetTimer",
          args: [],
         },
         {
           pendingMessage: "Resetting proof-of-life timer…",
           successMessage: "Timer reset successfully.",
         },
      );
    } catch {
      // handled by toast
    }
  };

  const handleDeleteRecovery = async () => {
    try {
      await execute(
        {
          address: NEXUS_RECOVERY_ADDRESS as any,
          abi: nexusRecoveryAbi as any,
          functionName: "deleteRecovery",
          args: [],
        },
        {
          pendingMessage: "Deleting recovery configuration…",
          successMessage: "Recovery configuration deleted.",
        },
      );
    } catch {
      // handled by toast
    }
  };

  const handleCancelClaim = async () => {
    try {
      await execute(
        {
          address: NEXUS_RECOVERY_ADDRESS as any,
          abi: nexusRecoveryAbi as any,
          functionName: "cancelClaim",
          args: [],
        },
        {
          pendingMessage: "Cancelling pending claim…",
          successMessage: "Claim cancelled successfully.",
        },
      );
    } catch {
      // handled by toast
    }
  };

  if (!address) {
    return (
      <div className="rounded-lg border border-dashed border-muted p-8 text-center text-muted-foreground">
        Connect your wallet to view the owner dashboard.
      </div>
    );
  }

  if (hasConfigLoading || configLoading) {
    return <div>Loading owner dashboard…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Owner Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage your recovery configuration, AVAX vault, and registered tokens.</p>
      </div>

      {!hasConfig ? (
        <RegisterRecoveryForm />
      ) : (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recovery Overview</CardTitle>
              <CardDescription>Current configuration and claim state.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Owner</p>
                  <p className="font-medium break-words">{address}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vault balance</p>
                  <p className="font-medium">{balanceLoading ? "Loading…" : formatAvax(balance ?? BigInt(0))} AVAX</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last proof of life</p>
                  <p className="font-medium">{config ? formatTimestamp(config.lastProofOfLife) : "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Inactivity period</p>
                  <p className="font-medium">
                    {config ? `${formatDuration(config.inactivityPeriod)}` : "—"}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Grace period</p>
                  <p className="font-medium">{config ? formatDuration(config.gracePeriod) : "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Claim state</p>
                  <p className="font-medium">{ClaimState[claimState]}</p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Heirs</p>
                  <div className="space-y-2">
                    {config?.heirs?.map((heir: string, index: number) => (
                      <div key={heir + index} className="rounded-lg border p-3">
                        <p className="font-medium break-words">{heir}</p>
                        <p className="text-sm text-muted-foreground">
                          Share: {splitToPercent(Number(config.splits?.[index] ?? 0))}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3 rounded-lg border p-4">
                  {claimState === ClaimState.Pending ? (
                    <>
                      <p className="text-sm text-muted-foreground">Grace remaining</p>
                      <p className="font-medium">
                        {graceCountdown !== null ? (
                          <CountdownDisplay seconds={graceCountdown} />
                        ) : (
                          "Calculating…"
                        )}
                      </p>
                      <Button type="button" disabled={isPending} onClick={handleCancelClaim} variant="secondary">
                        {isPending ? "Cancelling…" : "Cancel Claim"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">Inactivity countdown</p>
                      <p className="font-medium">
                        {inactivityCountdown !== null ? (
                          <CountdownDisplay seconds={inactivityCountdown} />
                        ) : (
                          "Calculating…"
                        )}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="space-y-6">
              <DepositAvaxForm />
              <WithdrawAvaxForm maxBalance={balance} />
              <RegisterTokenForm />
            </div>

            <div className="space-y-6">
              <RegisteredTokensList tokens={tokens as any} />
              <Card>
                <CardHeader>
                  <CardTitle>Owner Actions</CardTitle>
                  <CardDescription>Reset the timer or delete your recovery configuration.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button type="button" disabled={isPending || claimState === ClaimState.Pending} onClick={handleResetTimer}>
                    {isPending ? "Resetting…" : "Reset Proof-of-Life"}
                  </Button>
                  <Button type="button" variant="destructive" disabled={isPending} onClick={handleDeleteRecovery}>
                    {isPending ? "Deleting…" : "Delete Recovery"}
                  </Button>
                  {claimState === ClaimState.Pending ? (
                    <p className="text-sm text-muted-foreground">
                      Configuration changes are blocked while a claim is pending.
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
