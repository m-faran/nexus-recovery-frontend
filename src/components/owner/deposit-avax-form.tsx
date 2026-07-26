"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useContractTx } from "@/hooks/use-contract-tx";
import { NEXUS_RECOVERY_ADDRESS, nexusRecoveryAbi } from "@/lib/contracts";
import { parseAvax } from "@/lib/time";
import { ArrowUp, Vault } from "lucide-react";

export function DepositAvaxForm() {
  const [amount, setAmount] = useState("");
  const { execute, isPending } = useContractTx();
  const canSubmit = amount.trim().length > 0 && Number(amount) > 0;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    try {
      await execute(
        { address: NEXUS_RECOVERY_ADDRESS as any, abi: nexusRecoveryAbi as any, functionName: "depositAVAX", args: [], value: parseAvax(amount) } as any,
        { pendingMessage: "Depositing AVAX…", successMessage: "AVAX deposited into your vault." },
      );
      setAmount("");
    } catch {}
  };

  return (
    <Card className="card-surface">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/12 to-violet-500/12 border border-emerald-500/18 dark:border-emerald-400/22 shrink-0 mt-0.5">
            <Vault className="w-[1.125rem] h-[1.125rem] text-emerald-500 dark:text-emerald-400" />
          </div>
          <div>
            <CardTitle className="font-bold">Deposit AVAX</CardTitle>
            <CardDescription>Send AVAX to your recovery vault for later release to heirs.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="deposit-avax" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Amount (AVAX)
            </Label>
            <Input id="deposit-avax" type="number" min="0" step="0.001" className="mt-1"
              value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.0" />
          </div>
          <Button type="submit" disabled={!canSubmit || isPending}
            className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white border-0 shadow-md shadow-emerald-500/20 font-semibold">
            <ArrowUp size={15} />
            {isPending ? "Depositing…" : "Deposit AVAX"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
