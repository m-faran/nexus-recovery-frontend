# Nexus Recovery Frontend

A Next.js App Router frontend for the Nexus Recovery protocol on Avalanche Fuji.

## Setup

1. Copy `.env.local.example` to `.env.local`.
2. Set the following values:
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
   - `NEXT_PUBLIC_NEXUS_RECOVERY_ADDRESS`
   - `NEXT_PUBLIC_NEXUS_RECOVERY_VAULT_ADDRESS`
3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
```

5. Open `http://localhost:3000`.

## Features

- RainbowKit wallet connect on Avalanche Fuji
- Owner dashboard to register heirs, deposit AVAX, and manage registered tokens
- Heir portal to inspect owner config and initiate/execute claims
- Native AVAX vault support and countdown views for inactivity/grace windows
- Transaction toasts for pending, success, and failure states

## Build

```bash
npm run build
```

## Environment

Use `.env.local.example` as the template for required public variables.

## Notes

- Owner flows are gated by wallet connection and Fuji chain selection.
- The frontend assumes deployed contract addresses and a WalletConnect project ID.
