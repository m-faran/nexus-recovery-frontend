"use client";

import { ConnectGuard } from "@/components/shared/connect-guard";
import { HeirClaimPanel } from "@/components/heir/heir-claim-panel";

export default function HeirPage() {
  return (
    <ConnectGuard>
      <HeirClaimPanel />
    </ConnectGuard>
  );
}
