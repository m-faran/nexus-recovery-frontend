import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function StatItem({
  label,
  value,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border border-input bg-muted p-4", className)}>
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-1.5 text-base font-semibold break-words text-foreground">{value}</p>
    </div>
  );
}
