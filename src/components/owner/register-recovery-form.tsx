"use client";

import { useMemo, useState } from "react";
import { Plus, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useContractTx } from "@/hooks/use-contract-tx";
import { NEXUS_RECOVERY_ADDRESS, nexusRecoveryAbi } from "@/lib/contracts";
import { humanToSeconds } from "@/lib/time";

const MAX_HEIRS = 10;

function isValidAddress(address: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
}

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

  return (
    <Card className="card-surface space-y-4">
      <CardHeader>
        <CardTitle>Register Recovery</CardTitle>
        <CardDescription>
          Create your recovery configuration using heir addresses and basis-point splits.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            {heirs.map((item, index) => (
              <div key={index} className="grid gap-2 rounded-lg border p-4">
                <div className="flex items-center justify-between gap-4">
                  <Label className="font-semibold">Heir {index + 1}</Label>
                  {heirs.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeHeir(index)}
                    >
                      <Trash2 className="mr-2" size={14} />
                      Remove
                    </Button>
                  ) : null}
                </div>
                <div className="grid gap-2 sm:grid-cols-[1fr_132px]">
                  <div>
                    <Label htmlFor={`heir-${index}`}>Address</Label>
                    <Input
                      id={`heir-${index}`}
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

          <Button type="button" variant="secondary" onClick={addHeir} disabled={heirs.length >= MAX_HEIRS}>
            <Plus className="mr-2" size={14} />
            Add Heir
          </Button>

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

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Split total:</p>
              <p className={splitTotal === 10000 ? "text-sm text-foreground" : "text-sm text-destructive"}>
                {splitTotal}/10000
              </p>
            </div>
            <Button type="submit" disabled={!isValid || isPending}>
              {isPending ? "Submitting…" : (
                <>
                  <Check className="mr-2" size={14} />
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
