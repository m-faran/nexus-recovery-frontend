import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { fuji } from "@/lib/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "Nexus Recovery",
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "00000000000000000000000000000000",
  chains: [fuji],
  ssr: true,
});
