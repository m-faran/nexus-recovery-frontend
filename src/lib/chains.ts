import { defineChain } from "viem";

export const fuji = defineChain({
  id: 43113,
  name: "Avalanche Fuji Testnet",
  network: "fuji",
  nativeCurrency: { name: "Avalanche", symbol: "AVAX", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://api.avax-test.network/ext/bc/C/rpc"] },
  },
  blockExplorers: {
    default: { name: "Snowtrace", url: "https://testnet.snowtrace.io" },
  },
  testnet: true,
});

export const FUJI_CHAIN_ID = 43113;
