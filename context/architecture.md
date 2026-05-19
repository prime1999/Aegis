# Architecture Context

## Stack

| Layer       | Technology                            | Role                                                          |
| ----------- | ------------------------------------- | ------------------------------------------------------------- |
| Framework   | Next.js (App Router) + TypeScript     | Core full-stack framework handling UI and API routes          |
| UI          | TailwindCSS + shadcn/ui               | UI system for dashboard, wallet view, and AI chat interface   |
| Wallet/Web3 | Wagmi + Viem                          | Wallet connection, signing, and blockchain interaction        |
| Blockchain  | Mantle RPC                            | Read/write blockchain data and execute intents (future phase) |
| AI Engine   | Gemini AI API (GPT-based agent layer) | Intent parsing, reasoning, and decision generation            |
| Backend     | Next.js API Routes (Node.js runtime)  | Agent logic, memory updates, and intent processing            |
| Storage     | File-based JSON system (MVP)          | 6-file AI memory system for agent state and context           |
| Indexing    | Alchemy API (optional MVP layer)      | Wallet transaction history + token data                       |
| Database    | Supabase (PostgreSQL)                 | Core storage for users, intents, memory, and agent state      |
| Auth        | Wallet-based auth using SIWE          | user Authentication sessions                                  |

---

## System Boundaries

- `/app` — Handles UI routes including dashboard, wallet view, and AI chat interface
- `/app/api/agent` — Core AI agent runtime (intent processing, memory updates, decision flow)
- `/lib/agent` — Intent parser, decision engine, and memory manager (core AI logic)
- `/lib/web3` — Wallet connection utilities and Mantle blockchain interaction layer
- `/lib/indexer` — External blockchain data fetcher
- `/db` — Supabase schema definitions + database helpers

---

## Auth and Access Model

- Authentication will use wallet signature login using SIWE
- Each user fully owns their memory context and agent state
- Access is restricted so users can only view and modify their own:
  - intents
  - wallet data
  - session memory
- AI agent operates strictly within the context of a single wallet session

---

## Invariants

1. All AI actions must first be stored as an intent in Supabase before execution.

2. Supabase is the single source of truth (no file-based memory allowed anymore).

3. Every intent must go through:
   intent → validation → simulation → execution

4. No cross-user data access is allowed at any layer (enforced via RLS).

5. Agent state must always be persisted in Supabase after every decision cycle.

6. Blockchain execution (Mantle) must only happen AFTER database confirmation.

---
