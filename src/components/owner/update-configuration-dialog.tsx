"use client";

import { useMemo, useState, useEffect } from "react";
import { Plus, Trash2, Users, Check, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn, isValidAddress } from "@/lib/utils";
import { useContractTx } from "@/hooks/use-contract-tx";
import { NEXUS_RECOVERY_ADDRESS, nexusRecoveryAbi, RecoveryConfig } from "@/lib/contracts";
import { humanToSeconds } from "@/lib/time";

const MAX_HEIRS = 10;

function UpdateHeirsForm({ config, onSuccess }: { config: RecoveryConfig; onSuccess: () => void }) {
  const { execute, isPending } = useContractTx();
  const [heirs, setHeirs] = useState<{ address: string; split: string }[]>([]);

  // Initialize from config
  useEffect(() => {
    if (config?.heirs && config?.splits) {
      setHeirs(
        config.heirs.map((h, i) => ({
          address: h as string,
          split: config.splits[i].toString(),
        }))
      );
    }
  }, [config]);

  const splitTotal = useMemo(
    () => heirs.reduce((sum, item) => sum + Number(item.split || 0), 0),
    [heirs]
  );

  const isValid = useMemo(() => {
    if (heirs.length === 0 || heirs.length > MAX_HEIRS) return false;
    if (splitTotal !== 10000) return false;
    return heirs.every((item) => isValidAddress(item.address) && Number(item.split) > 0);
  }, [heirs, splitTotal]);

  const addHeir = () => {
    if (heirs.length >= MAX_HEIRS) return;
    setHeirs([...heirs, { address: "", split: "0" }]);
  };

  const removeHeir = (index: number) => {
    setHeirs((current) => current.filter((_, idx) => idx !== index));
  };

  const updateHeir = (index: number, key: "address" | "split", value: string) => {
    setHeirs((current) =>
      current.map((item, idx) => (idx === index ? { ...item, [key]: value } : item))
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) return;

    const heirsList = heirs.map((item) => item.address.trim());
    const splits = heirs.map((item) => Number(item.split));

    try {
      await execute(
        {
          address: NEXUS_RECOVERY_ADDRESS as any,
          abi: nexusRecoveryAbi as any,
          functionName: "updateHeirs",
          args: [heirsList, splits],
        },
        {
          pendingMessage: "Updating heirs…",
          successMessage: "Heirs updated successfully.",
        }
      );
      onSuccess();
    } catch {
      // handled by toast
    }
  };

  const splitPercent = Math.min(100, (splitTotal / 10000) * 100);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2">
        {heirs.map((item, index) => (
          <div key={index} className="grid gap-3 rounded-lg border border-input bg-muted p-4">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {index + 1}
                </span>
                Heir {index + 1}
              </span>
              {heirs.length > 1 ? (
                <Button type="button" variant="ghost" size="sm" onClick={() => removeHeir(index)}>
                  <Trash2 size={14} />
                  Remove
                </Button>
              ) : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
              <div>
                <Label htmlFor={`update-heir-${index}`}>Address</Label>
                <Input
                  id={`update-heir-${index}`}
                  placeholder="0x…"
                  value={item.address}
                  onChange={(event) => updateHeir(index, "address", event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`update-split-${index}`}>Split (bps)</Label>
                <Input
                  id={`update-split-${index}`}
                  type="number"
                  min={0}
                  max={10000}
                  value={item.split}
                  onChange={(event) => updateHeir(index, "split", event.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" onClick={addHeir} disabled={heirs.length >= MAX_HEIRS}>
        <Plus size={14} />
        Add Heir
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-muted/50 p-3 border border-border/50">
        <div className="flex items-center gap-3">
          <Users size={16} className="text-muted-foreground" />
          <div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    splitTotal === 10000 ? "bg-primary" : "bg-destructive"
                  )}
                  style={{ width: `${splitPercent}%` }}
                />
              </div>
              <p
                className={cn(
                  "text-xs font-semibold tabular-nums",
                  splitTotal === 10000 ? "text-foreground" : "text-destructive"
                )}
              >
                {splitTotal}/10000
              </p>
            </div>
          </div>
        </div>
        <Button type="submit" size="sm" disabled={!isValid || isPending}>
          {isPending ? "Updating…" : "Update Heirs"}
        </Button>
      </div>
    </form>
  );
}

function UpdatePeriodForm({
  label,
  currentSeconds,
  functionName,
  onSuccess,
}: {
  label: string;
  currentSeconds: bigint;
  functionName: "updateInactivityPeriod" | "updateGracePeriod";
  onSuccess: () => void;
}) {
  const { execute, isPending } = useContractTx();
  const [days, setDays] = useState("0");
  const [hours, setHours] = useState("0");

  useEffect(() => {
    const total = Number(currentSeconds);
    setDays(Math.floor(total / 86400).toString());
    setHours(Math.floor((total % 86400) / 3600).toString());
  }, [currentSeconds]);

  const isValid = useMemo(() => Number(days) > 0 || Number(hours) > 0, [days, hours]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) return;

    const periodSeconds = humanToSeconds(Number(days), Number(hours));
    if (periodSeconds === currentSeconds) {
      onSuccess(); // unchanged
      return;
    }

    try {
      await execute(
        {
          address: NEXUS_RECOVERY_ADDRESS as any,
          abi: nexusRecoveryAbi as any,
          functionName,
          args: [periodSeconds],
        },
        {
          pendingMessage: `Updating ${label.toLowerCase()}…`,
          successMessage: `${label} updated successfully.`,
        }
      );
      onSuccess();
    } catch {
      // handled
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-end gap-3 rounded-lg border border-border/50 bg-muted/20 p-4">
      <div className="grid w-full sm:w-auto flex-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`${functionName}-days`} className="text-xs text-muted-foreground uppercase">{label} (days)</Label>
          <Input
            id={`${functionName}-days`}
            type="number"
            min={0}
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${functionName}-hours`} className="text-xs text-muted-foreground uppercase">{label} (hours)</Label>
          <Input
            id={`${functionName}-hours`}
            type="number"
            min={0}
            value={hours}
            onChange={(e) => setHours(e.target.value)}
          />
        </div>
      </div>
      <Button type="submit" size="sm" variant="secondary" disabled={!isValid || isPending} className="w-full sm:w-auto shrink-0">
        <Clock size={14} className="mr-1.5" />
        {isPending ? "Updating…" : "Update"}
      </Button>
    </form>
  );
}

export function UpdateConfigurationDialog({ config }: { config: RecoveryConfig }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        Edit Config
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Configuration</DialogTitle>
          <DialogDescription>
            Update your heirs or recovery periods. Each section requires a separate transaction.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold tracking-wide text-foreground">1. Update Heirs</h3>
            <UpdateHeirsForm config={config} onSuccess={() => {}} />
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="text-sm font-semibold tracking-wide text-foreground">2. Update Timings</h3>
            <UpdatePeriodForm
              label="Inactivity Period"
              currentSeconds={config.inactivityPeriod}
              functionName="updateInactivityPeriod"
              onSuccess={() => {}}
            />
            <UpdatePeriodForm
              label="Grace Period"
              currentSeconds={config.gracePeriod}
              functionName="updateGracePeriod"
              onSuccess={() => {}}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
