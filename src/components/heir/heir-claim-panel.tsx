"use client";

import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { Search, PlayCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CountdownDisplay } from "@/components/shared/countdown-display";
import { StatItem } from "@/components/shared/stat-item";
import { useClaimActions } from "@/hooks/use-claim-actions";
import { useContractTx } from "@/hooks/use-contract-tx";
import { useHasConfig } from "@/hooks/use-has-config";
import { useRecoveryConfig } from "@/hooks/use-recovery-config";
import { useRegisteredTokens } from "@/hooks/use-registered-tokens";
import { RegisteredTokenItem } from "@/components/owner/registered-token-item";
import { useVaultBalance } from "@/hooks/use-vault-balance";
import { useIsHeir } from "@/hooks/use-is-heir";
import { useCountdown } from "@/hooks/use-countdown";
import { formatAvax, formatDuration, formatTimestamp, splitToPercent } from "@/lib/time";
import { ClaimState, NEXUS_RECOVERY_ADDRESS, nexusRecoveryAbi } from "@/lib/contracts";

function isValidAddress(address: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
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
        {
          address: NEXUS_RECOVERY_ADDRESS as any,
          abi: nexusRecoveryAbi as any,
          functionName: "initiateClaim",
          args: [normalizedOwner as any],
        },
        {
          pendingMessage: "Initiating claim…",
          successMessage: "Claim initiated.",
        },
      );
    } catch {
      // handled by toast
    }
  };

  const handleExecute = async () => {
    if (!normalizedOwner) return;
    try {
      await execute(
        {
          address: NEXUS_RECOVERY_ADDRESS as any,
          abi: nexusRecoveryAbi as any,
          functionName: "executeClaim",
          args: [normalizedOwner as any],
        },
        {
          pendingMessage: "Executing claim…",
          successMessage: "Claim executed and assets distributed.",
        },
      );
    } catch {
      // handled by toast
    }
  };

  const heirMessage = useMemo(() => {
    if (!normalizedOwner) return "Enter an owner address to inspect claims.";
    if (!hasConfig) return "No recovery configuration exists for this owner.";
    if (!isHeir) return "Your wallet is not a registered heir for this owner.";
    return "You are a registered heir for this owner.";
  }, [normalizedOwner, hasConfig, isHeir]);

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-(--header-foreground)">Heir Portal</h1>
        <p className="mt-2 text-(--header-muted)">
          Check owner recovery configuration and initiate or execute claims when eligible.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search size={18} className="text-primary" />
            Lookup Owner
          </CardTitle>
          <CardDescription>Enter the wallet address of the recovery owner.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div>
            <Label htmlFor="owner-address">Owner Address</Label>
            <Input
              id="owner-address"
              placeholder="0x…"
              value={ownerAddress}
              onChange={(event) => setOwnerAddress(event.target.value)}
            />
          </div>
          <p
            className={
              isHeir
                ? "flex items-center gap-1.5 text-sm font-medium text-primary"
                : "text-sm text-muted-foreground"
            }
          >
            {isHeir ? <CheckCircle2 size={14} /> : null}
            {heirMessage}
          </p>
        </CardContent>
      </Card>

      {normalizedOwner && hasConfig ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Owner Recovery Details</CardTitle>
                <CardDescription>Current config and claim progress.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <StatItem label="Last proof of life" value={formatTimestamp(config?.lastProofOfLife ?? BigInt(0))} />
                  <StatItem label="Claim state" value={ClaimState[claimState]} />
                  <StatItem label="Inactivity period" value={config ? formatDuration(config.inactivityPeriod) : "—"} />
                  <StatItem label="Grace period" value={config ? formatDuration(config.gracePeriod) : "—"} />
                  <StatItem
                    label="Your heir share"
                    value={
                      isHeir && heirs
                        ? `${splitToPercent(Number(splits?.[heirs.findIndex((h) => h.toLowerCase() === address?.toLowerCase()) ?? 0] ?? 0))}`
                        : "—"
                    }
                    className="sm:col-span-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Claim Actions</CardTitle>
                <CardDescription>Initiate or execute a claim on behalf of the owner.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <StatItem label="Initiate claim" value={canInitiate ? "Eligible" : "Not eligible yet"} />
                  <StatItem label="Execute claim" value={canExecute ? "Grace period elapsed" : "Not ready"} />
                </div>
                {claimState === ClaimState.Pending && (
                  <div className="rounded-lg border border-primary/25 bg-primary/5 p-4">
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Grace countdown</p>
                    <p className="text-2xl font-bold tabular-nums text-foreground">
                      {graceCountdown !== null ? (
                        <CountdownDisplay seconds={graceCountdown} />
                      ) : (
                        "Calculating…"
                      )}
                    </p>
                  </div>
                )}
                {claimState === ClaimState.None && inactivityCountdown !== null ? (
                  <div className="rounded-lg border border-primary/25 bg-primary/5 p-4">
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Inactivity countdown</p>
                    <p className="text-2xl font-bold tabular-nums text-foreground">
                      <CountdownDisplay seconds={inactivityCountdown} />
                    </p>
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-3">
                  <Button type="button" variant="secondary" disabled={!canInitiate || isPending} onClick={handleInitiate}>
                    <PlayCircle size={14} />
                    {isPending ? "Submitting…" : "Initiate Claim"}
                  </Button>
                  <Button type="button" disabled={!canExecute || isPending} onClick={handleExecute}>
                    <CheckCircle2 size={14} />
                    {isPending ? "Submitting…" : "Execute Claim"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Owner Vault</CardTitle>
                <CardDescription>Native AVAX and registered ERC-20 balances.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <StatItem label="AVAX in vault" value={`${formatAvax(balance ?? BigInt(0))} AVAX`} />
                <Separator />
                <div>
                  <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Registered tokens</p>
                  {tokens && tokens.length > 0 ? (
                    <ul className="space-y-2">
                      {tokens.map((token) => (
                        <li key={token.tokenAddress} className="rounded-lg border border-input bg-muted p-3">
                          <RegisteredTokenItem tokenAddress={token.tokenAddress} amount={token.amount} />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No ERC-20 tokens registered.</p>
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
