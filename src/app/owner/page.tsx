"use client";

import { ConnectGuard } from "@/components/shared/connect-guard";
import { OwnerDashboard } from "@/components/owner/owner-dashboard";

export default function OwnerPage() {
  return (
    <ConnectGuard>
      <OwnerDashboard />
    </ConnectGuard>
  );
}
