import React from "react";

function secondsToParts(seconds: number) {
  if (!seconds || seconds <= 0) return null;
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return { days, hours, minutes };
}

export function CountdownDisplay({ seconds }: { seconds: number | bigint | null }) {
  if (!seconds || seconds <= 0) return <span>0m</span>;
  const numericSeconds = typeof seconds === "bigint" ? Number(seconds) : seconds;
  const parts = secondsToParts(numericSeconds);
  if (!parts) return <span>0m</span>;
  const { days, hours, minutes } = parts;
  return (
    <span>
      {days > 0 ? `${days}d ` : ""}
      {hours > 0 ? `${hours}h ` : ""}
      {minutes}m
    </span>
  );
}
