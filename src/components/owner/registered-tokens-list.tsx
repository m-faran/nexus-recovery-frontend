"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldOff, Trash2 } from "lucide-react";
import { useContractTx } from "@/hooks/use-contract-tx";
import { NEXUS_RECOVERY_ADDRESS, nexusRecoveryAbi } from "@/lib/contracts";
import { erc20Abi } from "@/lib/abis/erc20";
import { RegisteredTokenItem } from "@/components/owner/registered-token-item";

export function RegisteredTokensList({
  tokens,
}: {
  tokens?: Array<{ tokenAddress: string; amount: bigint }>;
}) {
  const { execute, isPending } = useContractTx();

  const handleDeregister = async (tokenAddress: string) => {
    try {
      await execute(
        {
          address: NEXUS_RECOVERY_ADDRESS as any,
          abi: nexusRecoveryAbi as any,
          functionName: "deregisterToken",
          args: [tokenAddress as any],
        },
        {
          pendingMessage: "Deregistering token…",
          successMessage: "Token deregistered.",
        },
      );
    } catch {
      // handled by toast
    }
  };

  const handleRevokeApproval = async (tokenAddress: string) => {
    try {
      await execute(
        {
          address: tokenAddress as any,
          abi: erc20Abi as any,
          functionName: "approve",
          args: [NEXUS_RECOVERY_ADDRESS as any, BigInt(0)],
        },
        {
          pendingMessage: "Revoking token approval…",
          successMessage: "Token approval revoked.",
        },
      );
    } catch {
      // handled by toast
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registered Tokens</CardTitle>
        <CardDescription>Tokens currently configured for recovery.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {tokens && tokens.length > 0 ? (
          <div className="grid gap-3">
            {tokens.map((token) => (
              <div key={token.tokenAddress} className="rounded-lg border border-input bg-muted p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <RegisteredTokenItem tokenAddress={token.tokenAddress} amount={token.amount} />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isPending}
                      onClick={() => handleRevokeApproval(token.tokenAddress)}
                    >
                      <ShieldOff size={14} />
                      Revoke
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={isPending}
                      onClick={() => handleDeregister(token.tokenAddress)}
                    >
                      <Trash2 size={14} />
                      Deregister
                    </Button>
                  </div>
                  <p className="w-full text-sm text-muted-foreground">Revoke first, then deregister the token.</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No tokens have been registered yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
