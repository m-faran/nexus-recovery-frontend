"use client";

import { useEffect, useState } from "react";

export function useCountdown(targetTimestamp: bigint | undefined) {
  const [remaining, setRemaining] = useState<bigint>(BigInt(0));

  useEffect(() => {
    const compute = () => {
      if (!targetTimestamp || targetTimestamp === BigInt(0)) {
        setRemaining(BigInt(0));
        return;
      }
      const now = BigInt(Math.floor(Date.now() / 1000));
      const diff = targetTimestamp - now;
      setRemaining(diff > BigInt(0) ? diff : BigInt(0));
    };

    compute();
    const interval = setInterval(compute, 60_000);
    return () => clearInterval(interval);
  }, [targetTimestamp]);

  return remaining;
}
