# React App Template

This template captures the high-level methodology for starting a React website like the Nexus Recovery frontend.

## Core Decisions

- Use **React** as the UI library.
- Use **Next.js App Router** for routing, server rendering, and page layout structure.
- Use **TypeScript** for safer code and better editor support.
- Use **Tailwind CSS** for utility-first styling.
- Prefer a **shadcn/ui-style component system** with custom UI wrappers when needed.
- Use **RainbowKit + wagmi** for wallet connection and chain management when a web3 integration is required.
- Use **viem** for contract ABI interaction and typed contract calls.
- Use **React Query** or equivalent caching/data-fetching hooks for async state and contract reads.
- Keep environment configuration in `.env.local` and expose only safe client variables with `NEXT_PUBLIC_` prefix.
- Prefer composable hooks for domain logic (`use-contract-tx`, `use-countdown`, `use-recovery-config`, etc.).

## Project Structure

- `src/app/` - top-level pages and layout using Next.js App Router.
- `src/components/` - reusable UI and feature components.
- `src/hooks/` - custom React hooks for app state and contract behavior.
- `src/lib/` - shared utilities, contract addresses, chain configs, and helpers.
- `src/components/ui/` - UI primitives such as `Button`, `Card`, `Input`, `Label`, etc.

## Typical Setup Steps

1. Create the app with `npx create-next-app@latest --ts --tailwind --eslint --app`.
2. Add wallet/connect libraries if needed:
   - `wagmi`
   - `@rainbow-me/rainbowkit`
   - wallet connect provider package or cloud project ID
3. Add contract tooling:
   - `viem`
   - contract ABI files
4. Add UI helpers and shared design tokens in `globals.css`.
5. Build pages with a clear split between owner/admin flows and user/heir flows.
6. Keep contract interaction isolated in hooks and reusable helpers.

## UI Feature Checklist

These are the UI features we added and should generally reuse across apps:

- Soft color palette with brand accent tone
- Improved typography using a modern font stack like `Inter`
- Card surfaces with subtle borders and shadows
- Hover/highlight states on cards and buttons
- Responsive spacing and layout for forms and dashboard grids
- Clear CTA buttons with icon affordances
- Muted text for helper copy and secondary information
- Dark mode support with adjusted background and accent contrast
- Consistent form layout using labeled inputs, grouped fields, and spacing
- Toast notifications for async actions
- Network/chain alert when the wallet is not on the correct chain

## UI Change Targets

When a teammate only needs to change the UI, edit these files and folders:

- `src/app/page.tsx` — homepage layout and marketing sections
- `src/app/owner/page.tsx` — owner dashboard page wrapper
- `src/app/heir/page.tsx` — heir portal page wrapper
- `src/components/layout/header.tsx` — top navigation and header
- `src/components/ui/` — button, card, input, label, dialog, badge, and other UI primitives
- `src/components/shared/` — shared low-level UI pieces like network alerts and guards
- `src/components/owner/` — owner-facing forms and dashboard components
- `src/components/heir/` — heir-facing portal components
- `src/app/globals.css` — global theme tokens, colors, fonts, and card/button hover styles

Avoid changing these files for UI-only work:

- `src/hooks/` — contract logic and app behavior hooks
- `src/lib/` — blockchain helpers, contract ABIs, chain configurations, and utilities
- `src/components/owner/*` or `src/components/heir/*` only when implementing UI, not contract calls

## Reusable UI Patterns

- `card-surface` utility for consistent card panels
- `Button` variant system for default, secondary, ghost, and destructive actions
- `Label` + `Input` pairing with accessible `htmlFor` usage
- `ConnectGuard` for gating pages behind wallet connection
- `CountdownDisplay` for showing inactivity or grace windows

## Notes

- If you start a new project, begin with the high-level architecture first, then add styling and UI polish later.
- Keep the decisions documented in the README or `template.md` so you avoid re-choosing the same setup each time.
- Reuse this template as a checklist for both frontend structure and recurring UI interaction patterns.
