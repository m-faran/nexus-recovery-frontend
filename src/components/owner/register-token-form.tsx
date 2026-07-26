"use client";

import { useMemo, useState } from "react";
import { Check, Plus, Coins } from "lucide-react";
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
    try { return parseUnits(approveAmount, decimals); } catch { return null; }
  }, [approveAmount, decimals]);

  const registerValue = useMemo(() => {
    if (!registerAmount || isNaN(Number(registerAmount)) || Number(registerAmount) < 0) return null;
    try { return parseUnits(registerAmount, decimals); } catch { return null; }
  }, [registerAmount, decimals]);

  const allowance = allowanceData as bigint | undefined;
  const approved = registerValue !== null && allowance !== undefined && allowance >= registerValue;
  const canApprove = tokenAddressValid && approveValue !== null && ownerAddress !== undefined;
  const canRegister = tokenAddressValid && registerValue !== null && approved;

  const handleApprove = async () => {
    if (!canApprove || approveValue === null) return;
    try {
      await execute(
        { address: tokenAddress as any, abi: erc20Abi as any, functionName: "approve", args: [NEXUS_RECOVERY_ADDRESS as any, approveValue] },
        { pendingMessage: `Approving ${tokenAddress}…`, successMessage: "Token approval confirmed." },
      );
      if (registerValue !== null && approveValue >= registerValue) {
        await execute(
          { address: NEXUS_RECOVERY_ADDRESS as any, abi: nexusRecoveryAbi as any, functionName: "registerToken", args: [tokenAddress as any, registerValue] },
          { pendingMessage: "Registering token…", successMessage: "Token registered for recovery." },
        );
        setTokenAddress(""); setApproveAmount(""); setRegisterAmount("");
      }
    } catch {}
  };

  const handleRegister = async () => {
    if (!canRegister || registerValue === null) return;
    try {
      await execute(
        { address: NEXUS_RECOVERY_ADDRESS as any, abi: nexusRecoveryAbi as any, functionName: "registerToken", args: [tokenAddress as any, registerValue] },
        { pendingMessage: "Registering token…", successMessage: "Token registered for recovery." },
      );
      setTokenAddress(""); setApproveAmount(""); setRegisterAmount("");
    } catch {}
  };

  return (
    <Card className="card-surface">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/12 to-violet-500/12 border border-purple-500/18 dark:border-purple-400/22 shrink-0 mt-0.5">
            <Coins className="w-[1.125rem] h-[1.125rem] text-purple-500 dark:text-purple-400" />
          </div>
          <div>
            <CardTitle className="font-bold">Register ERC-20 Token</CardTitle>
            <CardDescription>Approve the recovery contract, then register a token for claim distribution.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="token-address" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Token Address</Label>
          <Input id="token-address" placeholder="0x…" className="mt-1 font-mono text-sm"
            value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value)} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="approve-amount" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Approval Amount</Label>
            <Input id="approve-amount" type="text" className="mt-1"
              value={approveAmount} onChange={(e) => setApproveAmount(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="register-amount" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Register Amount</Label>
            <Input id="register-amount" type="text" className="mt-1"
              value={registerAmount} onChange={(e) => setRegisterAmount(e.target.value)} />
          </div>
        </div>

        {tokenAddressValid && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Token decimals: <span className="font-bold text-violet-600 dark:text-violet-400">{decimals}</span>
          </p>
        )}

        {/* Status */}
        {approved ? (
          <div className="rounded-xl border border-emerald-200/60 dark:border-emerald-700/40 bg-emerald-50/50 dark:bg-emerald-950/20 px-3 py-2">
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">✓ Token allowance is sufficient to register this amount.</p>
          </div>
        ) : (
          <p className="text-xs muted-text">Approve first, then register the token.</p>
        )}

        <div className="flex flex-wrap gap-3">
          <Button type="button" disabled={!canApprove || isPending} onClick={handleApprove}
            className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0 shadow-md shadow-violet-500/20 font-semibold">
            <Check size={14} />
            {isPending ? "Approving…" : "Approve"}
          </Button>
          <Button type="button" disabled={!canRegister || isPending} onClick={handleRegister}
            className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white border-0 shadow-md shadow-emerald-500/20 font-semibold">
            <Plus size={14} />
            {isPending ? "Registering…" : "Register Token"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
