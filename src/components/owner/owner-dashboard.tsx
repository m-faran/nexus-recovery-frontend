"use client";

import { useMemo } from "react";
import { useAccount } from "wagmi";
import { RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatItem } from "@/components/shared/stat-item";
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
      <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
        Connect your wallet to view the owner dashboard.
      </div>
    );
  }

  if (hasConfigLoading || configLoading) {
    return <div className="text-(--header-muted)">Loading owner dashboard…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-(--header-foreground)">Owner Dashboard</h1>
        <p className="mt-2 text-(--header-muted)">Manage your recovery configuration, AVAX vault, and registered tokens.</p>
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
            <CardContent className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <StatItem label="Owner" value={address} className="sm:col-span-2 lg:col-span-3" />
                <StatItem
                  label="Vault balance"
                  value={`${balanceLoading ? "Loading…" : formatAvax(balance ?? BigInt(0))} AVAX`}
                />
                <StatItem
                  label="Last proof of life"
                  value={config ? formatTimestamp(config.lastProofOfLife) : "—"}
                />
                <StatItem label="Claim state" value={ClaimState[claimState]} />
                <StatItem
                  label="Inactivity period"
                  value={config ? formatDuration(config.inactivityPeriod) : "—"}
                />
                <StatItem
                  label="Grace period"
                  value={config ? formatDuration(config.gracePeriod) : "—"}
                  className="sm:col-span-2 lg:col-span-1"
                />
              </div>

              <Separator />

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div>
                  <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Heirs</p>
                  <div className="space-y-2">
                    {config?.heirs?.map((heir: string, index: number) => (
                      <div
                        key={heir + index}
                        className="flex items-center justify-between gap-3 rounded-lg border border-input bg-muted p-3.5"
                      >
                        <p className="break-words font-medium text-foreground">{heir}</p>
                        <Badge variant="secondary" className="shrink-0">
                          {splitToPercent(Number(config.splits?.[index] ?? 0))}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3 rounded-lg border border-primary/25 bg-primary/5 p-4">
                  {claimState === ClaimState.Pending ? (
                    <>
                      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Grace remaining</p>
                      <p className="text-2xl font-bold tabular-nums text-foreground">
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
                      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Inactivity countdown</p>
                      <p className="text-2xl font-bold tabular-nums text-foreground">
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
                  <Button
                    type="button"
                    className="w-full"
                    disabled={isPending || claimState === ClaimState.Pending}
                    onClick={handleResetTimer}
                  >
                    <RefreshCw size={14} />
                    {isPending ? "Resetting…" : "Reset Proof-of-Life"}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full"
                    disabled={isPending}
                    onClick={handleDeleteRecovery}
                  >
                    <Trash2 size={14} />
                    {isPending ? "Deleting…" : "Delete Recovery"}
                  </Button>
                  {claimState === ClaimState.Pending ? (
                    <p className="rounded-lg border border-destructive/25 bg-destructive/5 p-3 text-sm text-muted-foreground">
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
