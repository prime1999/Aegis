# Wallet AI – Agent Setup Rules

This project uses:

- wagmi + viem for wallet interaction
- SIWE (Sign-In With Ethereum) for authentication
- Supabase for database + persistence
- React Query (TanStack Query) for async state

---

# ⚙️ Required Project Structure

All implementations MUST follow this structure:

/src
/lib
/wagmi
config.ts

    /supabase
      client.ts
      server.ts

    /siwe
      message.ts
      verify.ts

/providers
wagmi-provider.tsx
query-provider.tsx

/hooks
useSiweLogin.ts

---

# 🧱 WAGMI RULES

- wagmi config MUST be in `/lib/wagmi/config.ts`
- Only injected wallet connector is allowed (MetaMask, Rabby, etc.)

---

# 🗄️ SUPABASE RULES

Supabase MUST be split into:

## Client usage

/lib/supabase/client.ts

- uses anon key only
- safe for frontend

---

# 🚀 GOAL

This system must behave like:

"Wallet connection + cryptographic proof + database-backed identity system"

NOT just wallet address login.
