"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useContractTx } from "@/hooks/use-contract-tx";
import { NEXUS_RECOVERY_ADDRESS, nexusRecoveryAbi } from "@/lib/contracts";
import { parseAvax } from "@/lib/time";
import { ArrowDown, Wallet } from "lucide-react";

export function WithdrawAvaxForm({ maxBalance }: { maxBalance: bigint | undefined }) {
  const [amount, setAmount] = useState("");
  const { execute, isPending } = useContractTx();
  const requested = amount.trim().length > 0 ? parseAvax(amount) : BigInt(0);
  const canSubmit = amount.trim().length > 0 && Number(amount) > 0 && maxBalance !== undefined && requested <= maxBalance;
  const overBalance = maxBalance !== undefined && requested > maxBalance;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    try {
      await execute(
        { address: NEXUS_RECOVERY_ADDRESS as any, abi: nexusRecoveryAbi as any, functionName: "withdrawAVAX", args: [requested] } as any,
        { pendingMessage: "Withdrawing AVAX…", successMessage: "AVAX withdrawal completed." },
      );
      setAmount("");
    } catch {}
  };

  return (
    <Card className="card-surface">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/12 to-purple-500/12 border border-violet-500/18 dark:border-violet-400/22 shrink-0 mt-0.5">
            <Wallet className="w-[1.125rem] h-[1.125rem] text-violet-500 dark:text-violet-400" />
          </div>
          <div>
            <CardTitle className="font-bold">Withdraw AVAX</CardTitle>
            <CardDescription>Move AVAX from your recovery vault back to your wallet.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="withdraw-avax" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Amount (AVAX)
            </Label>
            <Input id="withdraw-avax" type="number" min="0" step="0.001" className="mt-1"
              value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.0" />
          </div>
          {overBalance && (
            <p className="text-xs font-semibold text-red-500 dark:text-red-400">⚠ Amount exceeds current vault balance.</p>
          )}
          <Button type="submit" disabled={!canSubmit || isPending}
            className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0 shadow-md shadow-violet-500/20 font-semibold">
            <ArrowDown size={15} />
            {isPending ? "Withdrawing…" : "Withdraw AVAX"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
