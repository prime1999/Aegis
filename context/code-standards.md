# Code Standards (Aegis)

## General

- Keep modules small, focused, and single-purpose.
- Every module must have a clear ownership boundary (UI, AI logic, blockchain, or data layer — never mixed).
- Fix root causes instead of patching symptoms with workarounds.
- Do not mix unrelated responsibilities in the same component, hook, or API route.
- AI logic, blockchain logic, and UI logic must remain strictly separated.
- All user actions must pass through the intent system before any mutation.

---

## TypeScript

- Strict mode is required across the entire project.
- Avoid `any` — always define explicit interfaces or narrowly scoped types.
- External input (wallet data, API responses, AI outputs) must be validated before use.
- AI-generated outputs must always be parsed into structured types before execution.
- Prefer reusable type definitions in `/types` or `/lib/types`.

---

## Next.js (Framework Conventions)

- Default to Server Components unless client interactivity is required.
- Use `"use client"` only when necessary (wallet connection, chat input, UI state).
- Route handlers must be:
  - single-purpose
  - stateless where possible
  - free of UI logic
- Keep `/app/api/*` routes thin — business logic belongs in `/lib`.

---

## Styling

- Use CSS custom properties (design tokens) only — no hardcoded hex values in components.
- All colors must come from the Aegis design system (light mode blue + neutral palette).
- Follow spacing and border radius scale defined in `ui-context.md`.
- UI must remain consistent across:
  - dashboard
  - AI chat
  - wallet views
- Avoid over-styling — clarity > decoration.

---

## API Routes

- Validate and sanitize all inputs before processing.
- Every request must pass through authentication (SIWE session validation).
- Ownership must be enforced before any mutation (via Supabase RLS + server checks).
- AI agent requests must follow pipeline:
  intent → validation → simulation → execution (optional)
- API responses must always follow consistent structured formats:
  - success
  - error
  - data

---

## Data and Storage (Supabase Model)

- Supabase is the single source of truth.
- Store structured data only (users, intents, transactions, agent state).
- Large or computed data should NOT be stored directly in database fields.
- AI memory state must always be persisted in Supabase.
- Every intent must be stored before execution.
- No ephemeral AI state is allowed — everything must be traceable.

---

## File Organization

- `/app/` → UI routes (dashboard, chat, wallet interface)
- `/app/api/agent/` → AI agent runtime (intent processing + orchestration)
- `/lib/agent/` → Core AI logic (parser, decision engine, memory manager)
- `/lib/web3/` → Wallet, SIWE, Mantle interaction layer
- `/lib/indexer/` → Alchemy + blockchain data fetching
- `/db/` → Supabase schema definitions, queries, and helpers
- `/types/` → Shared TypeScript interfaces and AI schemas
- `/components/ui/` → shadcn/ui base components (unchanged)
