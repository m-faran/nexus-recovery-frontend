"use client";

import { useContractRead } from "wagmi";
import { erc20Abi } from "@/lib/abis/erc20";
import { formatUnits } from "viem";

export function RegisteredTokenItem({
  tokenAddress,
  amount,
}: {
  tokenAddress: string;
  amount: bigint;
}) {
  const { data: decimalsData } = useContractRead({
    address: tokenAddress as any,
    abi: erc20Abi as any,
    functionName: "decimals",
    query: { enabled: !!tokenAddress },
  });

  const decimals = Number(decimalsData ?? 18);

  let display = "";
  try {
    display = formatUnits(amount as any, decimals);
  } catch {
    display = amount.toString();
  }

  return (
    <div className="min-w-0">
      <p className="break-all font-medium text-foreground">{tokenAddress}</p>
      <p className="text-sm text-muted-foreground">Amount: {display}</p>
    </div>
  );
}
