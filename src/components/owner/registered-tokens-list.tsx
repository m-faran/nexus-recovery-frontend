"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trash2, Coins } from "lucide-react";
import { useContractTx } from "@/hooks/use-contract-tx";
import { NEXUS_RECOVERY_ADDRESS, nexusRecoveryAbi } from "@/lib/contracts";

export function RegisteredTokensList({
  tokens,
}: {
  tokens?: Array<{ tokenAddress: string; amount: bigint }>;
}) {
  const { execute, isPending } = useContractTx();

  const handleDeregister = async (tokenAddress: string) => {
    try {
      await execute(
        { address: NEXUS_RECOVERY_ADDRESS as any, abi: nexusRecoveryAbi as any, functionName: "deregisterToken", args: [tokenAddress as any] },
        { pendingMessage: "Deregistering token…", successMessage: "Token deregistered." },
      );
    } catch {}
  };

  return (
    <Card className="card-surface">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/12 to-emerald-500/12 border border-purple-500/18 dark:border-purple-400/22 shrink-0 mt-0.5">
            <Coins className="w-[1.125rem] h-[1.125rem] text-purple-500 dark:text-purple-400" />
          </div>
          <div>
            <CardTitle className="font-bold">Registered Tokens</CardTitle>
            <CardDescription>Tokens currently configured for recovery.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {tokens && tokens.length > 0 ? (
          <div className="grid gap-3">
            {tokens.map((token) => (
              <div key={token.tokenAddress}
                className="flex items-center justify-between gap-3 rounded-xl border border-purple-200/60 dark:border-purple-800/40 bg-purple-50/30 dark:bg-purple-950/15 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-purple-500 dark:text-purple-400 mb-0.5">Token</p>
                  <p className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300 break-all">{token.tokenAddress}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Amount: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{token.amount.toString()}</span>
                  </p>
                </div>
                <Button type="button" variant="destructive" size="sm" disabled={isPending}
                  onClick={() => handleDeregister(token.tokenAddress)}
                  className="gap-1.5 shrink-0 h-8 text-xs font-semibold">
                  <Trash2 size={12} /> Remove
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Coins className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-sm muted-text">No tokens have been registered yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
