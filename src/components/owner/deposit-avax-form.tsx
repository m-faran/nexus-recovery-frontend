"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useContractTx } from "@/hooks/use-contract-tx";
import { NEXUS_RECOVERY_ADDRESS, nexusRecoveryAbi } from "@/lib/contracts";
import { parseAvax } from "@/lib/time";

export function DepositAvaxForm() {
  const [amount, setAmount] = useState("");
  const { execute, isPending } = useContractTx();

  const canSubmit = amount.trim().length > 0 && Number(amount) > 0;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    try {
      await execute(
        {
          address: NEXUS_RECOVERY_ADDRESS as any,
          abi: nexusRecoveryAbi as any,
          functionName: "depositAVAX",
          args: [],
          value: parseAvax(amount),
        } as any,
        {
          pendingMessage: "Depositing AVAX…",
          successMessage: "AVAX deposited into your vault.",
        },
      );
      setAmount("");
    } catch {
      // handled by toast
    }
  };

  return (
    <Card className="card-surface">
      <CardHeader>
        <CardTitle>Deposit AVAX</CardTitle>
        <CardDescription>Send AVAX to your recovery vault for later release to heirs.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="deposit-avax">Amount</Label>
            <Input
              id="deposit-avax"
              type="number"
              min="0"
              step="0.001"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          <Button type="submit" disabled={!canSubmit || isPending}>
            {isPending ? "Depositing…" : (
              <>
                <ArrowUp className="mr-2" size={16} />
                Deposit AVAX
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
