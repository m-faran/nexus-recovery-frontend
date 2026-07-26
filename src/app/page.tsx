"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Shield,
  Clock,
  Vault,
  Users,
  ArrowRight,
  Lock,
  Zap,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Recovery Setup",
    description:
      "Register heir addresses with precise basis-point splits. Full control over who inherits and how much.",
    color: "text-emerald-500 dark:text-emerald-400",
    bg: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/15 dark:from-emerald-400/14 dark:border-emerald-400/20",
  },
  {
    icon: Clock,
    title: "Dead-Man Switch",
    description:
      "Configurable inactivity window automatically triggers the recovery process after owner silence.",
    color: "text-violet-500 dark:text-violet-400",
    bg: "from-violet-500/10 to-violet-500/5 border-violet-500/15 dark:from-violet-400/14 dark:border-violet-400/20",
  },
  {
    icon: Vault,
    title: "Vault Management",
    description:
      "Deposit AVAX and approve ERC-20 tokens. All assets are held on-chain with no custodial risk.",
    color: "text-emerald-500 dark:text-emerald-400",
    bg: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/15 dark:from-emerald-400/14 dark:border-emerald-400/20",
  },
  {
    icon: Users,
    title: "Heir Portal",
    description:
      "Heirs look up owners, verify eligibility, and drive the full initiate-to-execute claim flow.",
    color: "text-purple-500 dark:text-purple-400",
    bg: "from-purple-500/10 to-purple-500/5 border-purple-500/15 dark:from-purple-400/14 dark:border-purple-400/20",
  },
];

const steps = [
  {
    num: "1",
    title: "Configure",
    description: "Connect your wallet, register your heirs and set inactivity and grace windows.",
  },
  {
    num: "2",
    title: "Deposit",
    description: "Fund the vault with AVAX and register ERC-20 tokens for recovery.",
  },
  {
    num: "3",
    title: "Recover",
    description: "After inactivity is confirmed, heirs initiate and execute claims trustlessly.",
  },
];

export default function Home() {
  return (
    <div className="space-y-20 pb-12">
      {/* ── Hero ──────────────────────────────────────── */}
      <section className="relative card-surface glow-pulse overflow-hidden p-10 sm:p-14 fade-up">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-32 -right-32 w-80 h-80 rounded-full bg-gradient-to-br from-emerald-400/20 to-violet-500/20 blur-3xl dark:from-emerald-500/25 dark:to-violet-600/25" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-gradient-to-br from-violet-500/15 to-purple-600/15 blur-3xl dark:from-violet-500/20 dark:to-purple-600/20" />

        <div className="relative max-w-3xl space-y-7">
          {/* Brand pill */}
          <div>
            <span className="brand-pill">
              <Sparkles className="w-3 h-3" />
              Nexus Recovery · Avalanche Fuji
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-extrabold tracking-tight leading-[1.13] sm:text-5xl lg:text-[3.6rem]">
            Your digital assets,{" "}
            <span className="gradient-text">always recoverable.</span>
          </h1>

          {/* Sub-copy */}
          <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            Configure a dead-man switch recovery plan, deposit AVAX and ERC-20 assets,
            and let heirs initiate or execute claims after inactivity. 100% on-chain.
            Trustless. Permissionless.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <ConnectButton showBalance={false} chainStatus="icon" />
            <Link href="/owner">
              <Button
                id="cta-owner-dashboard"
                type="button"
                className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/45 border-0 h-10 px-5 font-semibold transition-all duration-200"
              >
                Owner Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/heir">
              <Button
                id="cta-heir-portal"
                type="button"
                className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/30 hover:shadow-violet-500/45 border-0 h-10 px-5 font-semibold transition-all duration-200"
              >
                <Users className="w-4 h-4" />
                Heir Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust strip ───────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 fade-up fade-up-delay-1">
        {[
          { icon: Lock, label: "100% On-chain", sub: "No custodial risk", color: "text-emerald-500 dark:text-emerald-400" },
          { icon: Zap, label: "Trustless Claims", sub: "Smart contract enforced", color: "text-violet-500 dark:text-violet-400" },
          { icon: CheckCircle2, label: "AVAX + ERC-20", sub: "Multi-asset support", color: "text-purple-500 dark:text-purple-400" },
        ].map(({ icon: Icon, label, sub, color }) => (
          <div key={label} className="card-surface flex items-center gap-4 p-5">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/10 to-violet-500/10 border border-emerald-500/15 dark:border-emerald-400/18 shrink-0">
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="font-bold text-sm">{label}</p>
              <p className="text-xs muted-text mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Features ──────────────────────────────────── */}
      <section className="space-y-10 fade-up fade-up-delay-2">
        <div className="text-center space-y-3">
          <span className="brand-pill mx-auto w-fit">Platform Features</span>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Everything you need for asset recovery
          </h2>
          <p className="muted-text max-w-xl mx-auto text-sm leading-relaxed">
            Nexus Recovery bundles vault management, heir registration, and claim
            flows into one seamless on-chain protocol.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description, color, bg }) => (
            <Card key={title} className="card-surface p-1 group">
              <CardHeader className="pb-2">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${bg} border mb-3 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <CardTitle className="text-base font-bold">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── How it works ──────────────────────────────── */}
      <section className="relative card-surface glow-pulse overflow-hidden p-8 sm:p-12 fade-up fade-up-delay-3 space-y-10">
        {/* Decorative */}
        <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br from-emerald-400/15 to-violet-500/15 blur-3xl dark:from-emerald-500/20 dark:to-violet-600/20" />

        <div className="relative text-center space-y-3">
          <span className="brand-pill mx-auto w-fit">How It Works</span>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Three steps to protected assets
          </h2>
        </div>

        <div className="relative grid gap-10 sm:grid-cols-3">
          {/* Connector line (desktop) */}
          <div className="hidden sm:block absolute top-5 left-[calc(16.66%+1.25rem)] right-[calc(16.66%+1.25rem)] h-px bg-gradient-to-r from-emerald-400/40 via-violet-400/40 to-purple-400/40 dark:from-emerald-500/50 dark:via-violet-500/50 dark:to-purple-500/50" />

          {steps.map(({ num, title, description }) => (
            <div key={num} className="relative flex flex-col items-start gap-4">
              <div className="step-badge z-10">{num}</div>
              <div>
                <h3 className="font-bold text-base mb-1.5">{title}</h3>
                <p className="text-sm muted-text leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="relative pt-2 flex flex-col sm:flex-row gap-3">
          <Link href="/owner">
            <Button
              id="how-it-works-owner-cta"
              type="button"
              className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400 border-0 shadow-lg shadow-emerald-500/25 font-semibold"
            >
              Get Started as Owner
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/heir">
            <Button
              id="how-it-works-heir-cta"
              type="button"
              className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 border-0 shadow-lg shadow-violet-500/25 font-semibold"
            >
              <Users className="w-4 h-4" />
              I&apos;m an Heir
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
