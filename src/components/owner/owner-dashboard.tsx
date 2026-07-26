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
import {
  LayoutDashboard, Wallet, Clock, Users, ShieldAlert,
  ShieldCheck, RefreshCw, Trash2, XCircle, Loader2,
} from "lucide-react";

/* ── Helpers ───────────────────────────────────────── */
function InfoRow({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
      <p className={`text-sm font-semibold break-all ${accent ? "text-emerald-600 dark:text-emerald-400" : "text-slate-800 dark:text-slate-200"}`}>
        {value}
      </p>
    </div>
  );
}

function ClaimStateBadge({ state }: { state: ClaimState }) {
  const map: Record<ClaimState, { label: string; cls: string }> = {
    [ClaimState.None]: { label: "None", cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" },
    [ClaimState.Pending]: { label: "⚡ Pending", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-700/50" },
    [ClaimState.Executed]: { label: "✓ Executed", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700/50" },
  };
  const { label, cls } = map[state] ?? map[ClaimState.None];
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${cls}`}>{label}</span>;
}

function SectionHeader({ icon: Icon, title, sub, color = "text-emerald-500 dark:text-emerald-400" }: {
  icon: React.ElementType; title: string; sub?: string; color?: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-1">
      <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/12 to-violet-500/12 border border-emerald-500/18 dark:border-emerald-400/22 shrink-0 mt-0.5">
        <Icon className={`w-4.5 h-4.5 w-[1.125rem] h-[1.125rem] ${color}`} />
      </div>
      <div>
        <p className="font-bold text-base text-slate-900 dark:text-slate-100">{title}</p>
        {sub && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/* ── Main Component ────────────────────────────────── */
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
        { address: NEXUS_RECOVERY_ADDRESS as any, abi: nexusRecoveryAbi as any, functionName: "resetTimer", args: [] },
        { pendingMessage: "Resetting proof-of-life timer…", successMessage: "Timer reset successfully." },
      );
    } catch {}
  };

  const handleDeleteRecovery = async () => {
    try {
      await execute(
        { address: NEXUS_RECOVERY_ADDRESS as any, abi: nexusRecoveryAbi as any, functionName: "deleteRecovery", args: [] },
        { pendingMessage: "Deleting recovery configuration…", successMessage: "Recovery configuration deleted." },
      );
    } catch {}
  };

  const handleCancelClaim = async () => {
    try {
      await execute(
        { address: NEXUS_RECOVERY_ADDRESS as any, abi: nexusRecoveryAbi as any, functionName: "cancelClaim", args: [] },
        { pendingMessage: "Cancelling pending claim…", successMessage: "Claim cancelled successfully." },
      );
    } catch {}
  };

  if (!address) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-sm muted-text">Connect your wallet to view the owner dashboard.</p>
      </div>
    );
  }

  if (hasConfigLoading || configLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] gap-2 text-sm muted-text">
        <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
        Loading owner dashboard…
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-up">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-violet-600 shadow-lg shadow-emerald-500/30">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight gradient-text">Owner Dashboard</h1>
        </div>
        <p className="muted-text text-sm ml-[3.25rem]">
          Manage your recovery configuration, AVAX vault, and registered tokens.
        </p>
      </div>

      {!hasConfig ? (
        <RegisterRecoveryForm />
      ) : (
        <div className="grid gap-6">
          {/* ── Recovery Overview ── */}
          <Card className="card-surface">
            <CardHeader>
              <SectionHeader icon={ShieldCheck} title="Recovery Overview" sub="Current configuration and claim state." />
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Row 1 */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <InfoRow label="Owner" value={`${address.slice(0, 6)}…${address.slice(-4)}`} />
                <InfoRow
                  label="Vault Balance"
                  value={balanceLoading ? "Loading…" : `${formatAvax(balance ?? BigInt(0))} AVAX`}
                  accent
                />
                <InfoRow label="Last Proof of Life" value={config ? formatTimestamp(config.lastProofOfLife) : "—"} />
                <InfoRow label="Inactivity Period" value={config ? formatDuration(config.inactivityPeriod) : "—"} />
              </div>

              <Separator className="bg-emerald-100/60 dark:bg-emerald-900/30" />

              {/* Row 2 */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <InfoRow label="Grace Period" value={config ? formatDuration(config.gracePeriod) : "—"} />
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Claim State</p>
                  <ClaimStateBadge state={claimState} />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {claimState === ClaimState.Pending ? "Grace Remaining" : "Inactivity Countdown"}
                  </p>
                  <div className="text-sm font-semibold">
                    {claimState === ClaimState.Pending ? (
                      graceCountdown !== null ? <CountdownDisplay seconds={graceCountdown} /> : <span className="muted-text">Calculating…</span>
                    ) : (
                      inactivityCountdown !== null ? <CountdownDisplay seconds={inactivityCountdown} /> : <span className="muted-text">Calculating…</span>
                    )}
                  </div>
                </div>
              </div>

              <Separator className="bg-emerald-100/60 dark:bg-emerald-900/30" />

              {/* Heirs */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-violet-500" /> Heirs
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {config?.heirs?.map((heir: string, index: number) => (
                    <div key={heir + index}
                      className="flex items-center justify-between gap-3 rounded-xl border border-violet-200/60 dark:border-violet-800/40 bg-violet-50/50 dark:bg-violet-950/20 px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wider text-violet-500 dark:text-violet-400 mb-0.5">Heir {index + 1}</p>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 break-all">{heir}</p>
                      </div>
                      <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700/50">
                        {splitToPercent(Number(config.splits?.[index] ?? 0))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cancel Claim */}
              {claimState === ClaimState.Pending && (
                <div className="rounded-xl border border-amber-200 dark:border-amber-700/50 bg-amber-50/60 dark:bg-amber-950/20 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    ⚡ A claim is currently pending. Cancel it to regain control.
                  </p>
                  <Button type="button" size="sm" disabled={isPending} onClick={handleCancelClaim}
                    className="gap-2 bg-amber-500 hover:bg-amber-400 text-white border-0 shrink-0">
                    <XCircle className="w-3.5 h-3.5" />
                    {isPending ? "Cancelling…" : "Cancel Claim"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Main grid: forms + sidebar ── */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="space-y-6">
              <DepositAvaxForm />
              <WithdrawAvaxForm maxBalance={balance} />
              <RegisterTokenForm />
            </div>
            <div className="space-y-6">
              <RegisteredTokensList tokens={tokens as any} />

              {/* Owner Actions */}
              <Card className="card-surface">
                <CardHeader>
                  <SectionHeader icon={ShieldAlert} title="Owner Actions" sub="Reset the timer or delete your recovery config." color="text-violet-500 dark:text-violet-400" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    type="button"
                    disabled={isPending || claimState === ClaimState.Pending}
                    onClick={handleResetTimer}
                    className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white border-0 shadow-md shadow-emerald-500/20 font-semibold"
                  >
                    <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />
                    {isPending ? "Resetting…" : "Reset Proof-of-Life"}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isPending}
                    onClick={handleDeleteRecovery}
                    className="w-full gap-2 font-semibold"
                  >
                    <Trash2 className="w-4 h-4" />
                    {isPending ? "Deleting…" : "Delete Recovery"}
                  </Button>
                  {claimState === ClaimState.Pending && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 text-center pt-1">
                      Configuration changes are blocked while a claim is pending.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
