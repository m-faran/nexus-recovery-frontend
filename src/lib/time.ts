import { formatEther, parseEther } from "viem";

export function formatAvax(wei: bigint): string {
  const avax = formatEther(wei);
  const num = Number(avax);
  if (num === 0) return "0";
  if (num < 0.0001) return avax;
  return num.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

export function parseAvax(amount: string): bigint {
  return parseEther(amount);
}

export function humanToSeconds(days: number, hours: number): bigint {
  const total = days * 86_400 + hours * 3_600;
  return BigInt(Math.max(0, total));
}

export function secondsToHuman(seconds: bigint): { days: number; hours: number } {
  const total = Number(seconds);
  const days = Math.floor(total / 86_400);
  const hours = Math.floor((total % 86_400) / 3_600);
  return { days, hours };
}

export function formatDuration(seconds: bigint): string {
  if (seconds <= BigInt(0)) return "Elapsed";

  const total = Number(seconds);
  const days = Math.floor(total / 86_400);
  const hours = Math.floor((total % 86_400) / 3_600);
  const minutes = Math.floor((total % 3_600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

  return parts.join(" ");
}

export function formatTimestamp(timestamp: bigint): string {
  if (timestamp === BigInt(0)) return "—";
  return new Date(Number(timestamp) * 1000).toLocaleString();
}

export function splitToPercent(basisPoints: number): string {
  return `${(basisPoints / 100).toFixed(2)}%`;
}
