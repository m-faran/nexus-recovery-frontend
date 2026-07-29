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

  const { data: nameData } = useContractRead({
    address: tokenAddress as any,
    abi: erc20Abi as any,
    functionName: "name",
    query: { enabled: !!tokenAddress },
  });

  const { data: symbolData } = useContractRead({
    address: tokenAddress as any,
    abi: erc20Abi as any,
    functionName: "symbol",
    query: { enabled: !!tokenAddress },
  });

  const name = typeof nameData === "string" && nameData.trim() ? nameData : "Unknown token";
  const symbol = typeof symbolData === "string" && symbolData.trim() ? symbolData : "";
  const decimals = Number(decimalsData ?? 18);

  let display = "";
  try {
    display = formatUnits(amount as any, decimals);
  } catch {
    display = amount.toString();
  }

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <p className="break-all font-medium text-foreground">{name}</p>
        {symbol ? <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">({symbol})</span> : null}
      </div>
      <p className="mt-1 break-all text-xs text-muted-foreground">{tokenAddress}</p>
      <p className="text-sm text-muted-foreground">Amount: {display}</p>
    </div>
  );
}
