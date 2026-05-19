# Aegis

An AI-powered wallet intelligence and intent execution platform built on Mantle. Aegis enables users to connect their wallets, analyze on-chain activity, understand blockchain interactions using natural language, and execute blockchain intents through an AI-assisted workflow.

## Overview

Aegis is designed for crypto users who want a smarter, more contextual, and simplified way to interact with Web3 without manually navigating complex DeFi interfaces and fragmented blockchain tools.

The platform continuously monitors tokens, protocols, and decentralized applications connected to a user's wallet activity, keeping users updated with relevant ecosystem developments, market movements, protocol updates, governance activity, security alerts, and important news related to their assets or applications.

By combining wallet analytics, AI reasoning, structured memory systems, real-time ecosystem awareness, and intent-driven execution, Aegis functions as a personalized on-chain AI companion.

## Goals

1. Build an AI agent capable of understanding wallet activity and user intent through natural language interaction.
2. Create a secure intent-based execution system where blockchain actions are validated before execution.
3. Develop a scalable memory-driven AI architecture that maintains user context, agent state, and transaction history over time.

## Core Features

### Wallet Intelligence

- Wallet connection using Wagmi + viem
- Wallet authentication via SIWE (Sign-In with Ethereum)
- Transaction history analysis
- Token balance aggregation
- Wallet activity summaries

### AI Agent System

- Natural language intent parsing
- Structured intent generation
- Persistent AI memory system
- Agent state tracking
- Context-aware responses

### Intent Execution Layer

- Intent validation pipeline
- Transaction simulation
- Mantle blockchain integration
- Future smart contract execution support

## Core User Flow

1. User visits the application homepage
2. User connects wallet using RainbowKit
3. User authenticates through SIWE (Sign-In with Ethereum)
4. System creates or retrieves user profile and session in Supabase
5. Wallet transaction history and token balances are fetched using Alchemy and Mantle RPC
6. User interacts with the AI agent through a chat-style interface
7. User submits a natural language intent (e.g., "Swap 0.1 ETH to USDC")
8. AI agent parses the intent, validates the request, checks system rules, and generates a structured action plan
9. User receives intent summary, simulation result, and estimated outcome
10. User approves execution and blockchain transaction is executed on Mantle
11. System stores intents, transaction logs, agent state updates, and memory context

## License

[Add license information]
