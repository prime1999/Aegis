# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Authentication

## Current Goal

- Implement wallet integration (wagmi + viem), Supabase Web3 authentication, Supabase persistence, and React Query state management

## Completed

- Installed and configured shadcn/ui with Radix Nova preset
- Added all required shadcn components: Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea
- Installed lucide-react for icons
- Created lib/utils.ts with cn() helper for merging Tailwind classes
- Configured app/globals.css with Aegis light theme CSS variables
- Verified all components import without errors
- Build completes successfully with no TypeScript errors
- Implemented responsive dashboard shell with navbar, sidebar, bottom navigation, and page layout
- SIWE verify now derives deterministic auth password from `SIWE_PASSWORD_SECRET` + wallet address
- SIWE verify now provisions/updates Supabase auth user with email format `address@aeigis.xyz`
- SIWE login now signs in through `supabase.auth.signInWithPassword` using server-derived credentials
- React Query `auth` cache now refreshes immediately after SIWE login
- Removed SIWE auth flow files and routes: `lib/siwe/*`, `hooks/useSiweLogin.ts`, `components/auth/sign-in-dialog.tsx`, `/api/auth/nonce`, `/api/auth/verify`
- Removed `siwe` dependency from `package.json`

## In Progress

- Wallet connection system (Mantle Sepolia connection, popover UI, address encoding)
- Authentication workflow — Supabase Web3 sign-in integration:
  - Read `lib/supabase/config.toml` and keep Supabase sign-in with Web3 enabled.
  - On successful Web3 sign-in, get the session and update the UI immediately.

## Next Up

- Wallet connect UI component
- Login flow implementation

## Architecture Decisions

- Using wagmi v2 with `createConfig` and injected connector for wallet support
- Supabase split into client.ts (anon key) and server.ts (service role key)
- TanStack Query for async state management
- Both wagmi and React Query providers wrap the app
- SIWE flow has been removed per updated auth spec; Web3 auth should use Supabase Web3 flow directly

## Open Questions

- [Any unresolved product or technical decisions]

## Architecture Decisions

- [Decisions made that affect the system design or
  data model — include why the decision was made]

## Session Notes

- Setup System complete - core infrastructure files created and building successfully
- Project structure: /lib/{wagmi, supabase}, /providers, /hooks
- Wagmi configured with injected connector on mainnet + sepolia
- Dependencies installed: wagmi v2, viem, @tanstack/react-query, @supabase/supabase-js
- Build completes with no TypeScript errors
- Layout system work started - navbar, sidebar, bottom nav, and page shell are being added
- Layout system completed - responsive shell components now compile cleanly
- Homepage simplified to navbar, bottom nav, and the generalAI image
