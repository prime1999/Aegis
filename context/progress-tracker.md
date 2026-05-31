# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Wallet Scanning

## Current Goal

- Implement Alchemy wallet scanning for the connected authenticated wallet

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
- Added `lib/alchemy.ts` with an Ethereum Sepolia Alchemy client and wallet scan categories
- Added `POST /api/wallet/scan` to validate the Supabase session, confirm the connected wallet, scan the last 90 days of `external`, `erc20`, and `erc721` activity, and log the result
- Wired the scan action to the bottom-nav scan icon and removed the hidden homepage scan trigger
- Switched the wallet scan indexer from manual log scanning to Alchemy transfer API pagination via `alchemy_getAssetTransfers`
- Added retry/backoff around Supabase `auth.getUser` in the wallet scan route
- Replaced ERC-20 contract metadata reads with Alchemy transfer data plus a local Sepolia `tx.to` protocol registry
- Added `POST /api/aiWalletAnalyzer` to analyze each scan result entry with Gemini and log the output
- Separated wallet scan and AI analyzer flows:
  - Removed AI analyzer execution from `/api/wallet/scan`
  - Moved wallet scan and AI analyzer calls into `useWalletScan` with React Query mutations
  - Added separate step state reporting for scan and analyzer phases in bottom-nav
- Added retry/backoff and fallback model handling in `/api/aiWalletAnalyzer` for transient Gemini `503 UNAVAILABLE` high-demand failures
- Implemented wallet analysis UI sidebar beside the AI image with GSAP entrance and animated category results
- Made the wallet analysis sidebar internally scrollable and animate result cards as they enter the scroll viewport with GSAP ScrollTrigger
- Wired the wallet analysis sidebar to the real wallet scan + AI analysis results via shared React Query cache
- Added mobile-only sheet wrappers for the wallet analysis and update sidebars with responsive open buttons
- Mounted the desktop updates sidebar beside the AI image on the homepage shell
- Refined the mobile sheet surfaces with glassmorphism backgrounds and translucent cards
- Moved the mobile sidebar trigger buttons to a fixed top-left position below the navbar
- Separated the mobile analysis and update triggers into top-left and top-right positions
- Closed the mobile analysis sheet after a successful Get Update action populates the update feed

## In Progress

- Wallet connection system (Ethereum Sepolia connection, popover UI, address encoding)
- Updates UI sidebar implementation for analyzer news results
  - Dialog now includes a sticky "Ask AI to translate" CTA at the bottom
  - Sidebar now stays hidden until wallet analysis data and ready updates are available
  - Get Update now populates a shared feed cache, so the updates sidebar only appears after a specific result is fetched
- AI update translate implementation (API route and UI wiring)
- Authentication workflow — Supabase Web3 sign-in integration:
  - Read `lib/supabase/config.toml` and keep Supabase sign-in with Web3 enabled.
  - On successful Web3 sign-in, get the session and update the UI immediately.
  - Deeper ERC-20 scan implementation (viem client + `api/scanInfo` + frontend reader)
- AI Wallet Analyzer API route implementation (app/api/aiWalletAnalyzer/route.ts) — completed
- AI analyzer updates API route (`app/api/updates/route.ts`) — in progress: add server route that accepts a comma-separated list of symbols (query or body), calls CryptoCompare, and logs the response

## Open Questions

- Which explicit Sepolia `tx.to` addresses should be added to the local protocol registry for known dApps and bridges?

## Next Up

- Wallet connect UI component
- Login flow implementation

## Architecture Decisions

- Using wagmi v2 with `createConfig` and injected connector for wallet support
- Supabase split into client.ts (anon key) and server.ts (service role key)
- TanStack Query for async state management
- Both wagmi and React Query providers wrap the app
- SIWE flow has been removed per updated auth spec; Web3 auth should use Supabase Web3 flow directly

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
- Wallet analysis sidebar is now rendered beside the homepage AI image with glassmorphism styling and GSAP animations
