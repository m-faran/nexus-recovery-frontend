"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="app-container space-y-10">
      <section className="card-surface p-8">
        <div className="max-w-3xl space-y-6">
          <div>
            <p className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-sky-700 dark:bg-sky-900/30 dark:text-sky-200">
              Nexus Recovery
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 dark:text-slate-100 sm:text-5xl">
              Avalanche Fuji recovery dashboard for owners and heirs.
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-700 dark:text-slate-300">
              Configure a dead-man switch recovery plan, deposit AVAX and ERC-20 assets, and let heirs initiate or execute claims after inactivity.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <ConnectButton showBalance={false} chainStatus="icon" />
            <Link href="/owner">
              <Button type="button">Go to Owner Dashboard</Button>
            </Link>
            <Link href="/heir">
              <Button type="button" variant="secondary">
                Open Heir Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="card-surface">
          <CardHeader>
            <CardTitle>Owner Dashboard</CardTitle>
            <CardDescription>Register heirs, deposit AVAX, manage tokens, reset proof-of-life, and monitor claims.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>Register heir addresses with basis-point splits.</li>
              <li>Deposit AVAX into the recovery vault.</li>
              <li>Approve and register ERC-20 tokens for recovery.</li>
              <li>Reset the inactivity timer or delete the recovery config.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="card-surface">
          <CardHeader>
            <CardTitle>Heir Portal</CardTitle>
            <CardDescription>Lookup an owner, verify heir status, and drive initiate / execute claim flows.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>Search by owner address to view recovery configuration.</li>
              <li>Check if your wallet is a registered heir.</li>
              <li>Initiate a claim after inactivity.</li>
              <li>Execute a claim once the grace period has elapsed.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
