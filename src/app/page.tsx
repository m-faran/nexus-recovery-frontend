"use client";

import Link from "next/link";
import { ShieldCheck, Users, ArrowRight } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="app-container space-y-10">
      <section className="rounded-xl border border-border bg-card p-8 shadow-sm sm:p-12">
        <div className="max-w-3xl space-y-6">
          <div>
            <p className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-[0.3em] text-primary uppercase">
              Nexus Recovery
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Avalanche Fuji recovery dashboard for owners and heirs.
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
              Configure a dead-man switch recovery plan, deposit AVAX and ERC-20 assets, and let heirs initiate or execute claims after inactivity.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <ConnectButton showBalance={false} chainStatus="icon" />
            <Link href="/owner">
              <Button type="button" size="lg">
                Go to Owner Dashboard
                <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/heir">
              <Button type="button" variant="outline" size="lg">
                Open Heir Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-primary" />
              Owner Dashboard
            </CardTitle>
            <CardDescription>Register heirs, deposit AVAX, manage tokens, reset proof-of-life, and monitor claims.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex gap-2.5">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                Register heir addresses with basis-point splits.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                Deposit AVAX into the recovery vault.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                Approve and register ERC-20 tokens for recovery.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                Reset the inactivity timer or delete the recovery config.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={20} className="text-primary" />
              Heir Portal
            </CardTitle>
            <CardDescription>Lookup an owner, verify heir status, and drive initiate / execute claim flows.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex gap-2.5">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                Search by owner address to view recovery configuration.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                Check if your wallet is a registered heir.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                Initiate a claim after inactivity.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                Execute a claim once the grace period has elapsed.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
