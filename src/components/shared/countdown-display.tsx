import React from "react";

function secondsToParts(seconds: number) {
  if (!seconds || seconds <= 0) return null;
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return { days, hours, minutes };
}

export function CountdownDisplay({ seconds }: { seconds: number | bigint | null }) {
  if (!seconds || seconds <= 0)
    return (
      <span className="inline-flex items-center gap-1">
        <span className="countdown-segment">
          <span className="text-sm font-bold tabular-nums text-blue-600 dark:text-blue-400">0</span>
          <span className="text-[10px] muted-text font-medium">min</span>
        </span>
      </span>
    );

  const numericSeconds = typeof seconds === "bigint" ? Number(seconds) : seconds;
  const parts = secondsToParts(numericSeconds);
  if (!parts)
    return (
      <span className="inline-flex items-center gap-1">
        <span className="countdown-segment">
          <span className="text-sm font-bold tabular-nums text-blue-600 dark:text-blue-400">0</span>
          <span className="text-[10px] muted-text font-medium">min</span>
        </span>
      </span>
    );

  const { days, hours, minutes } = parts;

  return (
    <span className="inline-flex items-center gap-1.5">
      {days > 0 && (
        <span className="countdown-segment">
          <span className="text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{days}</span>
          <span className="text-[10px] muted-text font-medium">day{days !== 1 ? "s" : ""}</span>
        </span>
      )}
      {(hours > 0 || days > 0) && (
        <span className="countdown-segment">
          <span className="text-sm font-bold tabular-nums text-violet-600 dark:text-violet-400">{hours}</span>
          <span className="text-[10px] muted-text font-medium">hr</span>
        </span>
      )}
      <span className="countdown-segment">
        <span className="text-sm font-bold tabular-nums text-purple-600 dark:text-purple-400">{minutes}</span>
        <span className="text-[10px] muted-text font-medium">min</span>
      </span>
    </span>
  );
}
