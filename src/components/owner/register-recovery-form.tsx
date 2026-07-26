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
import { ShieldCheck } from "lucide-react";

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
  }, [days, hours, heirs, splitTotal, graceDays, graceHours]);

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
        { address: NEXUS_RECOVERY_ADDRESS as any, abi: nexusRecoveryAbi as any, functionName: "registerRecovery", args: [heirsList, splits, inactivitySeconds, graceSeconds] },
        { pendingMessage: "Registering recovery configuration…", successMessage: "Recovery configuration registered." },
      );
    } catch {}
  };

  return (
    <Card className="card-surface">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/12 to-violet-500/12 border border-emerald-500/18 dark:border-emerald-400/22 shrink-0 mt-0.5">
            <ShieldCheck className="w-[1.125rem] h-[1.125rem] text-emerald-500 dark:text-emerald-400" />
          </div>
          <div>
            <CardTitle className="font-bold">Register Recovery</CardTitle>
            <CardDescription>Create your recovery config using heir addresses and basis-point splits.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Heir rows */}
          <div className="grid gap-3">
            {heirs.map((item, index) => (
              <div key={index} className="rounded-xl border border-violet-200/60 dark:border-violet-800/40 bg-violet-50/30 dark:bg-violet-950/15 p-4 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">Heir {index + 1}</p>
                  {heirs.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeHeir(index)}
                      className="gap-1.5 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 h-7">
                      <Trash2 size={12} /> Remove
                    </Button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
                  <div>
                    <Label htmlFor={`heir-${index}`} className="text-xs font-semibold uppercase tracking-wider text-slate-500">Address</Label>
                    <Input id={`heir-${index}`} placeholder="0x…" className="mt-1 font-mono text-sm"
                      value={item.address} onChange={(e) => updateHeir(index, "address", e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor={`split-${index}`} className="text-xs font-semibold uppercase tracking-wider text-slate-500">Split (bps)</Label>
                    <Input id={`split-${index}`} type="number" min={0} max={10000} className="mt-1"
                      value={item.split} onChange={(e) => updateHeir(index, "split", e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button type="button" variant="outline" onClick={addHeir} disabled={heirs.length >= MAX_HEIRS}
            className="gap-2 bg-white dark:bg-transparent border-violet-300 dark:border-violet-600 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:text-violet-800 dark:hover:text-violet-200 font-semibold">
            <Plus size={14} /> Add Heir
          </Button>

          <Separator className="bg-emerald-100/60 dark:bg-emerald-900/30" />

          {/* Period fields */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Inactivity Period</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="days" className="text-xs font-semibold text-slate-500">Days</Label>
                <Input id="days" type="number" min={0} className="mt-1"
                  value={days} onChange={(e) => setDays(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="hours" className="text-xs font-semibold text-slate-500">Hours</Label>
                <Input id="hours" type="number" min={0} className="mt-1"
                  value={hours} onChange={(e) => setHours(e.target.value)} />
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Grace Period</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="grace-days" className="text-xs font-semibold text-slate-500">Days</Label>
                <Input id="grace-days" type="number" min={0} className="mt-1"
                  value={graceDays} onChange={(e) => setGraceDays(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="grace-hours" className="text-xs font-semibold text-slate-500">Hours</Label>
                <Input id="grace-hours" type="number" min={0} className="mt-1"
                  value={graceHours} onChange={(e) => setGraceHours(e.target.value)} />
              </div>
            </div>
          </div>

          <Separator className="bg-emerald-100/60 dark:bg-emerald-900/30" />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Split Total:</p>
              <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${splitTotal === 10000 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"}`}>
                {splitTotal}/10000
              </span>
            </div>
            <Button type="submit" disabled={!isValid || isPending}
              className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white border-0 shadow-md shadow-emerald-500/20 font-semibold">
              {isPending ? "Submitting…" : (<><Check size={14} /> Register Recovery</>)}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
