# Aegis

## Overview

Aegis is an AI-powered wallet intelligence and intent execution platform built on Mantle. The platform allows users to connect their wallets, analyze wallet activity, understand blockchain interactions using natural language, and execute blockchain intents through an AI-assisted workflow. Aegis is designed for crypto users who want a smarter, more contextual, and simplified way to interact with Web3 without manually navigating complex DeFi interfaces and fragmented blockchain tools.

Beyond wallet interaction, Aegis continuously monitors the tokens, protocols, and decentralized applications connected to a user’s wallet activity. The platform keeps users updated with relevant ecosystem developments, market movements, protocol updates, governance activity, security alerts, and important news related to assets or applications they actively use. By combining wallet analytics, AI reasoning, structured memory systems, real-time ecosystem awareness, and intent-driven execution, Aegis functions as a personalized on-chain AI companion rather than just a crypto dashboard.

---

---

## Goals

1. Build an AI agent capable of understanding wallet activity and user intent through natural language interaction.

2. Create a secure intent-based execution system where blockchain actions are validated before execution.

3. Develop a scalable memory-driven AI architecture that maintains user context, agent state, and transaction history over time.

---

## Core User Flow

1. User visits the application homepage.

2. User connects wallet using RainbowKit.

3. User authenticates through SIWE (Sign-In with Ethereum).

4. System creates or retrieves user profile and session in Supabase.

5. Wallet transaction history and token balances are fetched using Alchemy and Mantle RPC.

6. User interacts with the AI agent through a chat-style interface.

7. User submits a natural language intent:
   - e.g. "Swap 0.1 ETH to USDC"

8. AI agent:
   - parses the intent
   - validates the request
   - checks system rules and user state
   - generates a structured action plan

9. User receives:
   - intent summary
   - simulation result
   - estimated action outcome

10. Future execution phase:

- user approves execution
- blockchain transaction is executed on Mantle

11. System stores:

- intents
- transaction logs
- agent state updates
- memory context

---

## Features

### Wallet Intelligence

- Wallet connection using Wagmi + viem
- Wallet authentication via SIWE
- Transaction history analysis
- Token balance aggregation
- Wallet activity summaries

---

### AI Agent System

- Natural language intent parsing
- Structured intent generation
- Persistent AI memory system
- Agent state tracking
- Context-aware responses

---

### Intent Execution Layer

- Intent validation pipeline
- Transaction simulation
- Mantle blockchain integration
- Future smart contract execution support

---

### Security and Access Control

- Wallet-based identity system
- Row Level Security (RLS) using Supabase
- Session validation
- Nonce-based SIWE verification

---

## Scope

### In Scope

- Wallet connection and authentication
- Wallet activity indexing
- AI-powered intent parsing
- Supabase-backed memory system
- Agent state management
- Intent simulation flow
- Mantle blockchain integration
- Transaction history visualization
- Structured AI runtime system

---

### Out of Scope

- Fully autonomous AI-controlled trading
- Cross-chain support outside Mantle (initial MVP)
- Advanced portfolio management tools
- DAO governance systems
- Social trading features
- High-frequency trading automation

---

## Success Criteria

1. A user can connect a wallet and authenticate successfully using SIWE.

2. The AI agent can correctly parse and structure wallet-related intents from natural language input.

3. Wallet transaction history and token balances are successfully displayed within the dashboard.

4. User intents are stored, tracked, and updated within Supabase.

5. The AI agent maintains persistent contextual memory across sessions.

6. Intent simulation works end-to-end before execution is introduced.

7. The system architecture remains modular, scalable, and compliant with defined invariants.

---
