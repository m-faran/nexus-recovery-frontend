"use client";

import { useMemo, useState } from "react";
import { Check, Plus } from "lucide-react";
import { useAccount, useContractRead } from "wagmi";
import { parseUnits } from "viem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useContractTx } from "@/hooks/use-contract-tx";
import { NEXUS_RECOVERY_ADDRESS, nexusRecoveryAbi } from "@/lib/contracts";
import { erc20Abi } from "@/lib/abis/erc20";

function isValidAddress(address: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
}

export function RegisterTokenForm() {
  const { address } = useAccount();
  const [tokenAddress, setTokenAddress] = useState("");
  const [approveAmount, setApproveAmount] = useState("");
  const [registerAmount, setRegisterAmount] = useState("");
  const { execute, isPending } = useContractTx();

  const tokenAddressValid = isValidAddress(tokenAddress);
  const ownerAddress = address as string | undefined;

  const { data: decimalsData } = useContractRead({
    address: tokenAddressValid ? (tokenAddress as any) : undefined,
    abi: erc20Abi as any,
    functionName: "decimals",
    query: { enabled: tokenAddressValid },
  });

  const { data: allowanceData } = useContractRead({
    address: tokenAddressValid ? (tokenAddress as any) : undefined,
    abi: erc20Abi as any,
    functionName: "allowance",
    args: ownerAddress ? [ownerAddress, NEXUS_RECOVERY_ADDRESS as any] : undefined,
    query: { enabled: tokenAddressValid && Boolean(ownerAddress) },
  });

  const decimals = Number(decimalsData ?? 18);

  const approveValue = useMemo(() => {
    if (!approveAmount || isNaN(Number(approveAmount)) || Number(approveAmount) < 0) return null;
    try {
      return parseUnits(approveAmount, decimals);
    } catch {
      return null;
    }
  }, [approveAmount, decimals]);

  const registerValue = useMemo(() => {
    if (!registerAmount || isNaN(Number(registerAmount)) || Number(registerAmount) < 0) return null;
    try {
      return parseUnits(registerAmount, decimals);
    } catch {
      return null;
    }
  }, [registerAmount, decimals]);

  const allowance = allowanceData as bigint | undefined;
  const approved = registerValue !== null && allowance !== undefined && allowance >= registerValue;
  const canApprove = tokenAddressValid && approveValue !== null && ownerAddress !== undefined;
  const canRegister = tokenAddressValid && registerValue !== null && approved;

  const handleApprove = async () => {
    if (!canApprove || approveValue === null) return;
    try {
      await execute(
        {
          address: tokenAddress as any,
          abi: erc20Abi as any,
          functionName: "approve",
          args: [NEXUS_RECOVERY_ADDRESS as any, approveValue],
        },
        {
          pendingMessage: `Approving ${tokenAddress}…`,
          successMessage: "Token approval confirmed.",
        },
      );

      if (registerValue !== null && approveValue >= registerValue) {
        await execute(
          {
            address: NEXUS_RECOVERY_ADDRESS as any,
            abi: nexusRecoveryAbi as any,
            functionName: "registerToken",
            args: [tokenAddress as any, registerValue],
          },
          {
            pendingMessage: "Registering token…",
            successMessage: "Token registered for recovery.",
          },
        );
        setTokenAddress("");
        setApproveAmount("");
        setRegisterAmount("");
      }
    } catch {
      // handled by toast
    }
  };

  const handleRegister = async () => {
    if (!canRegister || registerValue === null) return;
    try {
      await execute(
        {
          address: NEXUS_RECOVERY_ADDRESS as any,
          abi: nexusRecoveryAbi as any,
          functionName: "registerToken",
          args: [tokenAddress as any, registerValue],
        },
        {
          pendingMessage: "Registering token…",
          successMessage: "Token registered for recovery.",
        },
      );
      setTokenAddress("");
      setApproveAmount("");
      setRegisterAmount("");
    } catch {
      // handled by toast
    }
  };

  return (
    <Card className="card-surface">
      <CardHeader>
        <CardTitle>Register ERC-20 Token</CardTitle>
        <CardDescription>
          Approve the recovery contract, then register a token for claim distribution.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div>
          <Label htmlFor="token-address">Token Address</Label>
          <Input
            id="token-address"
            value={tokenAddress}
            onChange={(event) => setTokenAddress(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="approve-amount">Approval Amount</Label>
          <Input
            id="approve-amount"
            type="text"
            value={approveAmount}
            onChange={(event) => setApproveAmount(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="register-amount">Register Amount</Label>
          <Input
            id="register-amount"
            type="text"
            value={registerAmount}
            onChange={(event) => setRegisterAmount(event.target.value)}
          />
          <p className="text-sm text-muted-foreground">Decimals: {decimals}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="button" disabled={!canApprove || isPending} onClick={handleApprove} variant="secondary">
            {isPending ? "Approving…" : (
              <>
                <Check className="mr-2" size={14} />
                Approve
              </>
            )}
          </Button>
          <Button type="button" disabled={!canRegister || isPending} onClick={handleRegister}>
            {isPending ? "Registering…" : (
              <>
                <Plus className="mr-2" size={14} />
                Register Token
              </>
            )}
          </Button>
        </div>
        {approved ? (
          <p className="text-sm text-green-600">Token allowance is sufficient to register this amount.</p>
        ) : (
          <p className="text-sm text-muted-foreground">Approve first, then register the token.</p>
        )}
      </CardContent>
    </Card>
  );
}
