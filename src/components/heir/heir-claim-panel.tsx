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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Heir Portal</h1>
        <p className="text-muted-foreground mt-2">
          Check owner recovery configuration and initiate or execute claims when eligible.
        </p>
      </div>

      <Card className="card-surface">
        <CardHeader>
          <CardTitle>Lookup Owner</CardTitle>
          <CardDescription>Enter the wallet address of the recovery owner.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div>
            <Label htmlFor="owner-address">Owner Address</Label>
            <Input
              id="owner-address"
              value={ownerAddress}
              onChange={(event) => setOwnerAddress(event.target.value)}
            />
          </div>
          <p className="text-sm text-muted-foreground">{heirMessage}</p>
        </CardContent>
      </Card>

      {normalizedOwner && hasConfig ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <Card className="card-surface">
              <CardHeader>
                <CardTitle>Owner Recovery Details</CardTitle>
                <CardDescription>Current config and claim progress.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Last proof of life</p>
                    <p className="font-medium">{formatTimestamp(config?.lastProofOfLife ?? BigInt(0))}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Claim state</p>
                    <p className="font-medium">{ClaimState[claimState]}</p>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Inactivity period</p>
                    <p className="font-medium">{config ? formatDuration(config.inactivityPeriod) : "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Grace period</p>
                    <p className="font-medium">{config ? formatDuration(config.gracePeriod) : "—"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your heir share</p>
                  <p className="font-medium">
                    {isHeir && heirs
                      ? `${splitToPercent(Number(splits?.[heirs.findIndex((h) => h.toLowerCase() === address?.toLowerCase()) ?? 0] ?? 0))}`
                      : "—"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="card-surface">
              <CardHeader>
                <CardTitle>Claim Actions</CardTitle>
                <CardDescription>Initiate or execute a claim on behalf of the owner.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Initiate claim</p>
                    <p className="font-medium">
                      {canInitiate ? "Eligible" : "Not eligible yet"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Execute claim</p>
                    <p className="font-medium">
                      {canExecute ? "Grace period elapsed" : "Not ready"}
                    </p>
                  </div>
                </div>
                {claimState === ClaimState.Pending && (
                  <div>
                    <p className="text-sm text-muted-foreground">Grace countdown</p>
                    <p className="font-medium">
                      {graceCountdown !== null ? (
                        <CountdownDisplay seconds={graceCountdown} />
                      ) : (
                        "Calculating…"
                      )}
                    </p>
                  </div>
                )}
                {claimState === ClaimState.None && inactivityCountdown !== null ? (
                  <div>
                    <p className="text-sm text-muted-foreground">Inactivity countdown</p>
                    <p className="font-medium">
                      <CountdownDisplay seconds={inactivityCountdown} />
                    </p>
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-3">
                  <Button type="button" variant="secondary" disabled={!canInitiate || isPending} onClick={handleInitiate}>
                    {isPending ? "Submitting…" : "Initiate Claim"}
                  </Button>
                  <Button type="button" disabled={!canExecute || isPending} onClick={handleExecute}>
                    {isPending ? "Submitting…" : "Execute Claim"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="card-surface">
              <CardHeader>
                <CardTitle>Owner Vault</CardTitle>
                <CardDescription>Native AVAX and registered ERC-20 balances.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">AVAX in vault</p>
                  <p className="font-medium">{formatAvax(balance ?? BigInt(0))} AVAX</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Registered tokens</p>
                  {tokens && tokens.length > 0 ? (
                    <ul className="space-y-2">
                      {tokens.map((token) => (
                        <li key={token.tokenAddress} className="rounded-lg border p-3">
                          <p className="font-medium break-words">{token.tokenAddress}</p>
                          <p className="text-sm text-muted-foreground">Amount: {token.amount.toString()}</p>
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
