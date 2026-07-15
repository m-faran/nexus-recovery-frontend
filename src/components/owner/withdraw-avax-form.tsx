"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useContractTx } from "@/hooks/use-contract-tx";
import { NEXUS_RECOVERY_ADDRESS, nexusRecoveryAbi } from "@/lib/contracts";
import { parseAvax } from "@/lib/time";

export function WithdrawAvaxForm({ maxBalance }: { maxBalance: bigint | undefined }) {
  const [amount, setAmount] = useState("");
  const { execute, isPending } = useContractTx();

  const requested = amount.trim().length > 0 ? parseAvax(amount) : BigInt(0);
  const canSubmit = amount.trim().length > 0 && Number(amount) > 0 && maxBalance !== undefined && requested <= maxBalance;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    try {
      await execute(
        {
          address: NEXUS_RECOVERY_ADDRESS as any,
          abi: nexusRecoveryAbi as any,
          functionName: "withdrawAVAX",
          args: [requested],
        } as any,
        {
          pendingMessage: "Withdrawing AVAX…",
          successMessage: "AVAX withdrawal completed.",
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
        <CardTitle>Withdraw AVAX</CardTitle>
        <CardDescription>Move AVAX from your recovery vault back to your wallet.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="withdraw-avax">Amount</Label>
            <Input
              id="withdraw-avax"
              type="number"
              min="0"
              step="0.001"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          <Button type="submit" disabled={!canSubmit || isPending}>
            {isPending ? "Withdrawing…" : (
              <>
                <ArrowDown className="mr-2" size={16} />
                Withdraw AVAX
              </>
            )}
          </Button>
          {maxBalance !== undefined && requested > maxBalance ? (
            <p className="text-sm text-destructive">Amount exceeds current vault balance.</p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
