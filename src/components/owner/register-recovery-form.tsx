"use client";

import { useMemo, useState } from "react";
import { Plus, Check, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn, isValidAddress } from "@/lib/utils";
import { useContractTx } from "@/hooks/use-contract-tx";
import { NEXUS_RECOVERY_ADDRESS, nexusRecoveryAbi } from "@/lib/contracts";
import { humanToSeconds } from "@/lib/time";

const MAX_HEIRS = 10;

export function RegisterRecoveryForm() {
  const { execute, isPending } = useContractTx();
  const [heirs, setHeirs] = useState([{ address: "", split: "5000" }, { address: "", split: "5000" }]);
  const [days, setDays] = useState("30");
  const [hours, setHours] = useState("0");
  const [graceDays, setGraceDays] = useState("1");
  const [graceHours, setGraceHours] = useState("0");

  const splitTotal = useMemo(
    () => heirs.reduce((sum, item) => sum + Number(item.split || 0), 0),
    [heirs],
  );

  const isValid = useMemo(() => {
    if (heirs.length === 0 || heirs.length > MAX_HEIRS) return false;
    if (splitTotal !== 10000) return false;
    if (!Number(days) && !Number(hours)) return false;
    if (!Number(graceDays) && !Number(graceHours)) return false;
    return heirs.every((item) => isValidAddress(item.address) && Number(item.split) > 0);
  }, [days, hours, heirs, splitTotal]);

  const addHeir = () => {
    if (heirs.length >= MAX_HEIRS) return;
    setHeirs([...heirs, { address: "", split: "0" }]);
  };

  const removeHeir = (index: number) => {
    setHeirs((current) => current.filter((_, idx) => idx !== index));
  };

  const updateHeir = (index: number, key: "address" | "split", value: string) => {
    setHeirs((current) =>
      current.map((item, idx) => (idx === index ? { ...item, [key]: value } : item)),
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValid) return;

    const heirsList = heirs.map((item) => item.address.trim());
    const splits = heirs.map((item) => Number(item.split));
    const inactivitySeconds = humanToSeconds(Number(days), Number(hours));
    const graceSeconds = humanToSeconds(Number(graceDays), Number(graceHours));

    try {
      await execute(
        {
          address: NEXUS_RECOVERY_ADDRESS as any,
          abi: nexusRecoveryAbi as any,
          functionName: "registerRecovery",
          args: [heirsList, splits, inactivitySeconds, graceSeconds],
        },
        {
          pendingMessage: "Registering recovery configuration…",
          successMessage: "Recovery configuration registered.",
        },
      );
    } catch {
      // error handled by toast
    }
  };

  const splitPercent = Math.min(100, (splitTotal / 10000) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register Recovery</CardTitle>
        <CardDescription>
          Create your recovery configuration using heir addresses and basis-point splits.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-3">
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
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeHeir(index)}
                    >
                      <Trash2 size={14} />
                      Remove
                    </Button>
                  ) : null}
                </div>
                <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
                  <div>
                    <Label htmlFor={`heir-${index}`}>Address</Label>
                    <Input
                      id={`heir-${index}`}
                      placeholder="0x…"
                      value={item.address}
                      onChange={(event) => updateHeir(index, "address", event.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`split-${index}`}>Split (bps)</Label>
                    <Input
                      id={`split-${index}`}
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

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="days">Inactivity period (days)</Label>
              <Input
                id="days"
                type="number"
                min={0}
                value={days}
                onChange={(event) => setDays(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="hours">Inactivity period (hours)</Label>
              <Input
                id="hours"
                type="number"
                min={0}
                value={hours}
                onChange={(event) => setHours(event.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="grace-days">Grace period (days)</Label>
              <Input
                id="grace-days"
                type="number"
                min={0}
                value={graceDays}
                onChange={(event) => setGraceDays(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="grace-hours">Grace period (hours)</Label>
              <Input
                id="grace-hours"
                type="number"
                min={0}
                value={graceHours}
                onChange={(event) => setGraceHours(event.target.value)}
              />
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Users size={18} className="text-muted-foreground" />
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Split total</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1.5 w-28 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        splitTotal === 10000 ? "bg-primary" : "bg-destructive",
                      )}
                      style={{ width: `${splitPercent}%` }}
                    />
                  </div>
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      splitTotal === 10000 ? "text-foreground" : "text-destructive",
                    )}
                  >
                    {splitTotal}/10000
                  </p>
                </div>
              </div>
            </div>
            <Button type="submit" disabled={!isValid || isPending}>
              {isPending ? "Submitting…" : (
                <>
                  <Check size={14} />
                  Register Recovery
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
