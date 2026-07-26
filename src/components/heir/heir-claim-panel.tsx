"use client";

import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CountdownDisplay } from "@/components/shared/countdown-display";
import { useClaimActions } from "@/hooks/use-claim-actions";
import { useContractTx } from "@/hooks/use-contract-tx";
import { useHasConfig } from "@/hooks/use-has-config";
import { useRecoveryConfig } from "@/hooks/use-recovery-config";
import { useRegisteredTokens } from "@/hooks/use-registered-tokens";
import { useVaultBalance } from "@/hooks/use-vault-balance";
import { useIsHeir } from "@/hooks/use-is-heir";
import { useCountdown } from "@/hooks/use-countdown";
import { formatAvax, formatDuration, formatTimestamp, splitToPercent } from "@/lib/time";
import { ClaimState, NEXUS_RECOVERY_ADDRESS, nexusRecoveryAbi } from "@/lib/contracts";
import {
  Users, Search, ShieldCheck, Zap, Vault,
  CheckCircle2, XCircle, Clock, Loader2,
} from "lucide-react";

function isValidAddress(address: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
}

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

export function HeirClaimPanel() {
  const { address } = useAccount();
  const [ownerAddress, setOwnerAddress] = useState("");
  const normalizedOwner = isValidAddress(ownerAddress) ? ownerAddress.trim() : undefined;
  const { hasConfig } = useHasConfig(normalizedOwner as any);
  const { config } = useRecoveryConfig(normalizedOwner as any);
  const { tokens } = useRegisteredTokens(normalizedOwner as any);
  const { balance } = useVaultBalance(normalizedOwner as any);
  const { isHeir, heirs, splits } = useIsHeir(normalizedOwner as any, address as any);
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

  const canInitiate = isHeir && claimActions.canInitiate;
  const canExecute = isHeir && claimActions.canExecute;

  const handleInitiate = async () => {
    if (!normalizedOwner) return;
    try {
      await execute(
        { address: NEXUS_RECOVERY_ADDRESS as any, abi: nexusRecoveryAbi as any, functionName: "initiateClaim", args: [normalizedOwner as any] },
        { pendingMessage: "Initiating claim…", successMessage: "Claim initiated." },
      );
    } catch {}
  };

  const handleExecute = async () => {
    if (!normalizedOwner) return;
    try {
      await execute(
        { address: NEXUS_RECOVERY_ADDRESS as any, abi: nexusRecoveryAbi as any, functionName: "executeClaim", args: [normalizedOwner as any] },
        { pendingMessage: "Executing claim…", successMessage: "Claim executed and assets distributed." },
      );
    } catch {}
  };

  const heirStatus = useMemo(() => {
    if (!normalizedOwner) return { msg: "Enter an owner address to inspect a recovery config.", type: "idle" };
    if (!hasConfig) return { msg: "No recovery configuration exists for this owner.", type: "warn" };
    if (!isHeir) return { msg: "Your wallet is not a registered heir for this owner.", type: "error" };
    return { msg: "✓ You are a registered heir for this owner.", type: "success" };
  }, [normalizedOwner, hasConfig, isHeir]);

  const statusColors = {
    idle: "text-slate-500 dark:text-slate-400",
    warn: "text-amber-600 dark:text-amber-400",
    error: "text-red-500 dark:text-red-400",
    success: "text-emerald-600 dark:text-emerald-400 font-semibold",
  };

  return (
    <div className="space-y-8 fade-up">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
            <Users className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>Heir Portal</h1>
        </div>
        <p className="muted-text text-sm ml-[3.25rem]">
          Check owner recovery configuration and initiate or execute claims when eligible.
        </p>
      </div>

      {/* ── Lookup Card ── */}
      <Card className="card-surface">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/12 to-purple-500/12 border border-violet-500/18 dark:border-violet-400/22 shrink-0 mt-0.5">
              <Search className="w-[1.125rem] h-[1.125rem] text-violet-500 dark:text-violet-400" />
            </div>
            <div>
              <CardTitle className="font-bold">Lookup Owner</CardTitle>
              <CardDescription>Enter the wallet address of the recovery owner.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="owner-address" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Owner Address
            </Label>
            <Input
              id="owner-address"
              placeholder="0x..."
              value={ownerAddress}
              onChange={(event) => setOwnerAddress(event.target.value)}
              className="mt-1 font-mono text-sm"
            />
          </div>
          <p className={`text-sm ${statusColors[heirStatus.type as keyof typeof statusColors]}`}>
            {heirStatus.msg}
          </p>
        </CardContent>
      </Card>

      {/* ── Details (shown when owner found) ── */}
      {normalizedOwner && hasConfig ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            {/* Recovery Details */}
            <Card className="card-surface">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/12 to-violet-500/12 border border-emerald-500/18 dark:border-emerald-400/22 shrink-0">
                    <ShieldCheck className="w-[1.125rem] h-[1.125rem] text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="font-bold">Owner Recovery Details</CardTitle>
                    <CardDescription>Current config and claim progress.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoRow label="Last Proof of Life" value={formatTimestamp(config?.lastProofOfLife ?? BigInt(0))} />
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Claim State</p>
                    <ClaimStateBadge state={claimState} />
                  </div>
                  <InfoRow label="Inactivity Period" value={config ? formatDuration(config.inactivityPeriod) : "—"} />
                  <InfoRow label="Grace Period" value={config ? formatDuration(config.gracePeriod) : "—"} />
                </div>

                <Separator className="bg-violet-100/60 dark:bg-violet-900/30" />

                {/* Your Share */}
                <div className="flex items-center justify-between rounded-xl border border-emerald-200/60 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/20 px-4 py-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Your Heir Share</p>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {isHeir && heirs
                        ? splitToPercent(Number(splits?.[heirs.findIndex((h) => h.toLowerCase() === address?.toLowerCase()) ?? 0] ?? 0))
                        : "Not an heir"}
                    </p>
                  </div>
                  {isHeir
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    : <XCircle className="w-5 h-5 text-red-400" />
                  }
                </div>

                {/* Countdowns */}
                {claimState === ClaimState.Pending && graceCountdown !== null && (
                  <div className="flex items-center gap-3 rounded-xl border border-amber-200/60 dark:border-amber-700/40 bg-amber-50/50 dark:bg-amber-950/20 px-4 py-3">
                    <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Grace Countdown</p>
                      <div className="mt-1"><CountdownDisplay seconds={graceCountdown} /></div>
                    </div>
                  </div>
                )}
                {claimState === ClaimState.None && inactivityCountdown !== null && (
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200/60 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-900/30 px-4 py-3">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Inactivity Countdown</p>
                      <div className="mt-1"><CountdownDisplay seconds={inactivityCountdown} /></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Claim Actions */}
            <Card className="card-surface">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/12 to-purple-500/12 border border-violet-500/18 dark:border-violet-400/22 shrink-0">
                    <Zap className="w-[1.125rem] h-[1.125rem] text-violet-500 dark:text-violet-400" />
                  </div>
                  <div>
                    <CardTitle className="font-bold">Claim Actions</CardTitle>
                    <CardDescription>Initiate or execute a claim on behalf of the owner.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Eligibility indicators */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className={`rounded-xl border px-4 py-3 ${canInitiate ? "border-emerald-200/60 dark:border-emerald-700/40 bg-emerald-50/50 dark:bg-emerald-950/20" : "border-slate-200/50 dark:border-slate-700/40 bg-slate-50/30 dark:bg-slate-900/20"}`}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Initiate Claim</p>
                    <p className={`text-sm font-bold mt-1 ${canInitiate ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}>
                      {canInitiate ? "✓ Eligible" : "Not eligible yet"}
                    </p>
                  </div>
                  <div className={`rounded-xl border px-4 py-3 ${canExecute ? "border-emerald-200/60 dark:border-emerald-700/40 bg-emerald-50/50 dark:bg-emerald-950/20" : "border-slate-200/50 dark:border-slate-700/40 bg-slate-50/30 dark:bg-slate-900/20"}`}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Execute Claim</p>
                    <p className={`text-sm font-bold mt-1 ${canExecute ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}>
                      {canExecute ? "✓ Grace elapsed" : "Not ready"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-1">
                  <Button
                    type="button"
                    disabled={!canInitiate || isPending}
                    onClick={handleInitiate}
                    className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0 shadow-md shadow-violet-500/25 font-semibold"
                  >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    {isPending ? "Submitting…" : "Initiate Claim"}
                  </Button>
                  <Button
                    type="button"
                    disabled={!canExecute || isPending}
                    onClick={handleExecute}
                    className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white border-0 shadow-md shadow-emerald-500/25 font-semibold"
                  >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    {isPending ? "Submitting…" : "Execute Claim"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: Vault */}
          <div className="space-y-6">
            <Card className="card-surface">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/12 to-violet-500/12 border border-emerald-500/18 dark:border-emerald-400/22 shrink-0">
                    <Vault className="w-[1.125rem] h-[1.125rem] text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="font-bold">Owner Vault</CardTitle>
                    <CardDescription>Native AVAX and registered ERC-20 balances.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border border-emerald-200/60 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/20 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">AVAX in Vault</p>
                  <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {formatAvax(balance ?? BigInt(0))} <span className="text-sm font-bold">AVAX</span>
                  </p>
                </div>

                <Separator className="bg-emerald-100/60 dark:bg-emerald-900/30" />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                    Registered Tokens
                  </p>
                  {tokens && tokens.length > 0 ? (
                    <ul className="space-y-2">
                      {tokens.map((token) => (
                        <li key={token.tokenAddress}
                          className="rounded-xl border border-violet-200/50 dark:border-violet-800/40 bg-violet-50/40 dark:bg-violet-950/15 px-3 py-2.5">
                          <p className="text-xs font-mono font-medium text-violet-700 dark:text-violet-300 break-all">{token.tokenAddress}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Amount: {token.amount.toString()}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm muted-text">No ERC-20 tokens registered.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}
