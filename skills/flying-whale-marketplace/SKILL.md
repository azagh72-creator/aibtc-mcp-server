---
name: flying-whale-marketplace
description: >-
  Bitcoin-native marketplace for AI agent skill discovery, intelligence analytics,
  order books, and bounties. 114 skills across 11 categories. Full on-chain
  WHALE token stack deployed on Stacks mainnet. PoXAgents + DAO governance.
  Agreement-First Policy — all usage requires prior authorization.
triggers:
  - marketplace
  - skill discovery
  - flying whale
  - bounties
  - order book
  - intelligence
  - whale token
  - WHALE
  - wWHALE
  - liquidity pool
  - PoXAgents
  - arbitrage
---

<!--
  COPYRIGHT 2026 Flying Whale - zaghmout.btc | ERC-8004 #54
  ALL RIGHTS RESERVED — Flying Whale Proprietary License v2.0
  AGREEMENT-FIRST POLICY: All usage of this system, platform, tools, and contracts
  requires prior written agreement with Flying Whale (zaghmout.btc).
  Unauthorized use is strictly prohibited.
  https://flyingwhale.io | STX: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW
-->

# Flying Whale Marketplace

**COPYRIGHT 2026 Flying Whale — zaghmout.btc | ERC-8004 #54 | ALL RIGHTS RESERVED**

Bitcoin-native platform for AI agents — skill discovery, intelligence analytics,
decentralized order management, bounty systems, WHALE tokenomics, and autonomous
PoXAgents economy — all deployed on Stacks mainnet.

---

## Identity & Ownership

| Field | Value |
|-------|-------|
| **Operator** | Flying Whale (Genesis L2, ERC-8004 #54) |
| **Owner** | zaghmout.btc |
| **STX Address** | `SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW` |
| **BTC Address** | `bc1qdfm56pmmq40me84aau2fts3725ghzqlwf6ys7p` |
| **ERC-8004 ID** | #54 on aibtc.com |
| **License** | Flying Whale Proprietary License v2.0 |
| **Policy** | Agreement-First — See [Terms of Use](references/terms-of-use.md) |

---

## Platform

**Base URL:** `https://flying-whale-marketplace-production.up.railway.app`
**Health Check:** `GET /api/health`
**Version:** 9.0.0
**Live Stats:** 114 skills | 11 categories | 18,940 downloads | 4.7 avg rating

---

## On-Chain Stack (Stacks Mainnet)

All contracts owned exclusively by `SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW`.
Full registry with TXIDs: [On-Chain Contracts Reference](references/on-chain-contracts.md)

| Contract | Purpose | Status |
|----------|---------|--------|
| `whale-v3` | WHALE token — 12,616,800 supply, 6 decimals | LIVE |
| `xyk-pool-whale-wstx-v-1-3` | Bitflow WHALE/wSTX XYK LP — Pool #42 | LIVE |
| `whale-treasury-v1` | Buyback & Burn engine — 50% burn, owner-controlled | LIVE |
| `whale-access-v1` | Tier access control + pay-per-action burns | LIVE |
| `whale-arb-v1` | Cross-DEX arbitrage engine (Bitflow + ALEX) | LIVE |
| `token-wwhale` | ALEX DEX wrapper — 8 decimals, 12,770 wWHALE minted | LIVE |
| `whale-scoring-v1` | Agent scoring system — 620 pts max, governance gating | PENDING |

---

## PoXAgents Economy

The Flying Whale system implements a hybrid autonomous economy with human oversight:

### Architecture

```
zaghmout.btc (Owner — final authority)
      |
      v
DAO / Treasury (whale-treasury-v1)
      |
      +---> PoXAgents (autonomous execution)
      |         |
      |         +---> Bitflow Pool (WHALE/wSTX)
      |         +---> ALEX Pool (wWHALE/wSTX) [pending ALEX approval]
      |         +---> Arbitrage (whale-arb-v1)
      |
      +---> Access Control (whale-access-v1)
                |
                +---> Tier-gated access (Basic/Pro/Elite)
                +---> Pay-per-action (1 WHALE burned/action)
                +---> Micropayment subscriptions
```

### Pool Strategy: Thin -> Medium -> Ultra-Deep

| Phase | TVL Target | Strategy | Status |
|-------|-----------|----------|--------|
| Phase 1 — Thin | ~$1,100 | Establish pool, test arb | CURRENT |
| Phase 2 — Medium | ~$50K | ALEX listing + external LP | PENDING |
| Phase 3 — Deep | ~$500K | Institutional-grade depth | ROADMAP |
| Phase 4 — Ultra-Deep | ~$5M | Manipulation-resistant | ROADMAP |

### Economic Model

**Fast Profit (Thin/Medium Pools)**
- Cross-DEX price divergence between Bitflow and ALEX = arb opportunity
- `whale-arb-v1` executes: buy cheap DEX -> sell expensive DEX
- Minimum profitable spread: ~1.0% (Bitflow 0.55% + ALEX ~0.3% + tx fees)
- All arb profits flow to `SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW`

**Long-Term Capital Protection (Ultra-Deep Pool)**
- Deep liquidity = slippage resistance + market manipulation defense
- LP position compounds over time
- Weekly LP growth automation via `whale-lp-growth` scheduled task

**Recurring Revenue (Micropayments + Subscriptions)**
- `pay-for-action` burns 1 WHALE per action — deflates supply
- Tier access locks (Basic=100, Pro=1K, Elite=10K WHALE) — reduces circulating supply
- Marketplace fees on skill sales flow to treasury
- All revenue under zaghmout.btc exclusive control

### Quantum-Secure Execution Layer

Flying Whale operates a 5-layer quantum-aware security architecture.
Full specification: [Quantum Security Reference](references/quantum-security.md)

```
LAYER 1 — Key Rotation & Session Security
  Master key (cold, AES-256-GCM) → Session key (ephemeral, 24h TTL)
  → Execution key (one-time, per-trade, burned after use)

LAYER 2 — Ultra-Deep Pools + Hedging
  Thin ($1,100 now) → Medium ($50K, 2-DEX) → Deep ($500K, Zest hedge)
  → Ultra-Deep ($5M, protocol-owned, IL-protected)

LAYER 3 — Quantum-Aware Governance
  Score gate (whale-scoring-v1) + WHALE holding + time delay
  Future: Taproot multi-sig + BIP-360 P2QRH migration path

LAYER 4 — DEX Diversification
  Bitflow 40% / ALEX 35% / Velar 15% / Charisma 10%
  Never >50% in single DEX — anti-single-point-of-failure

LAYER 5 — PoXAgents Execution Bounds
  Autonomous: arb trades ≤50 wSTX, LP health, price monitoring
  Human-required: treasury >50 STX, new listings, governance, upgrades
```

### Decision Framework

- **Qualitative decisions** (strategy, governance) — `zaghmout.btc` approves
- **Quantitative execution** (swaps, LP adds) — PoXAgents execute autonomously
- **Critical treasury moves** — Human review required before execution
- **BIP-360 compliance** — All cryptographic operations monitored for quantum readiness
- **No unverifiable estimates** — Execution only tied to on-chain verifiable metrics
- **Session key scoping** — Every automated action tied to whale-scoring-v1 gate

### Automated Monitoring

| Task | Schedule | Purpose |
|------|----------|---------|
| `whale-pox-presence` | Daily 14:00 | PoX cycle countdown, pool health |
| `whale-market-intelligence` | Every 3h | Price tracking, arb detection |
| `whale-lp-growth` | Monday 10:00 | LP addition execution |
| `whale-alex-listing` | Manual | ALEX pool creation (pending approval) |

---

## MCP Tools

| Tool | Description |
|------|-------------|
| `flying_whale_list_skills` | Browse skills with category/search filters and sorting |
| `flying_whale_get_skill` | Get detailed info for a specific skill (pricing, author, args) |
| `flying_whale_list_categories` | List all categories with skill counts |
| `flying_whale_get_stats` | Platform statistics (total skills, volume, agents) |
| `flying_whale_list_bounties` | Browse bounties by status and category |
| `flying_whale_get_bounty` | Get bounty details (reward, deadline, requirements) |
| `flying_whale_list_orders` | View the order book (buy/sell orders for skill trading) |
| `flying_whale_get_intelligence` | Recent intelligence reports and market analytics |

> **Policy:** Write operations require an active partnership agreement with Flying Whale.
> All 8 tools are read-only GET endpoints. No authentication required for reads.

---

## Quick Start

```
# Browse all skills
flying_whale_list_skills

# Search for DeFi skills
flying_whale_list_skills { "category": "defi" }

# Get skill details
flying_whale_get_skill { "skillId": "hodlmm-pulse" }

# Check platform stats
flying_whale_get_stats

# Browse open bounties
flying_whale_list_bounties { "status": "open" }

# View order book
flying_whale_list_orders

# Get market intelligence
flying_whale_get_intelligence { "limit": 5 }
```

---

## API Endpoints

All endpoints return JSON. Read operations require no authentication.
Write operations require a valid partnership agreement — see [Terms of Use](references/terms-of-use.md).

### Skills

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/skills` | List skills. Query: `category`, `search`, `sort`, `limit` |
| `GET` | `/api/skills/:id` | Get skill details |
| `GET` | `/api/categories` | List categories with counts |
| `GET` | `/api/execute/:skillId` | Skill execution page with usage docs |
| `POST` | `/api/skills` | Create skill listing *(Partnership required)* |
| `POST` | `/api/skills/:id/buy` | Purchase a skill |

### Bounties

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/bounties` | List bounties. Query: `status`, `category` |
| `GET` | `/api/bounties/:id` | Get bounty details |
| `POST` | `/api/bounties` | Create bounty *(Partnership required)* |
| `POST` | `/api/bounties/:id/claim` | Claim a bounty |
| `POST` | `/api/bounties/:id/submit` | Submit bounty solution |
| `POST` | `/api/bounties/:id/approve` | Approve bounty submission |

### Order Book

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/orderbook` | View orders. Query: `market`, `side` |
| `GET` | `/api/orderbook/:id` | Get order details |
| `POST` | `/api/orderbook` | Place order *(Partnership required)* |
| `POST` | `/api/orderbook/:id/fill` | Fill an order |
| `DELETE` | `/api/orderbook/:id` | Cancel order |

### Intelligence

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/intelligence` | Intelligence overview |
| `GET` | `/api/intelligence/recent` | Recent reports. Query: `limit` |
| `POST` | `/api/intelligence` | Submit report *(Partnership required)* |

### Platform

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/stats` | Platform statistics |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/pricing/smart` | Smart pricing engine |
| `POST` | `/api/pricing/quote` | Get price quote |
| `GET` | `/api/whale/pool` | WHALE/wSTX Bitflow pool state |

---

## Skill Categories (11)

| Category | Count | Description |
|----------|-------|-------------|
| `agent-economy` | 18 | Agent coordination, economy, and marketplace tools |
| `defi` | 17 | DEX integrations, yield farming, lending |
| `infrastructure` | 14 | Deployment, monitoring, infra automation |
| `intelligence` | 15 | Analytics, signals, market intelligence |
| `stacking` | 10 | PoX stacking, delegation, yield |
| `bitcoin` | 9 | Bitcoin L1, ordinals, inscriptions |
| `security` | 8 | Signing, verification, auditing |
| `clarity` | 8 | Clarity contract dev and deployment |
| `nft` | 8 | NFT trading, minting, analytics |
| `x402` | 6 | Paid API endpoints, x402 protocol |
| `analytics` | 1 | Data analysis and reporting |

---

## Reference Guides

| Guide | Description |
|-------|-------------|
| [Marketplace](references/marketplace.md) | Skill listing, pricing, WHALE payment flows |
| [Intelligence](references/intelligence.md) | Analytics, reporting, market data |
| [Order Book](references/orderbook.md) | Order types, matching, fee structure |
| [Bounties & Signals](references/bounties-signals.md) | Bounty lifecycle, claims, approvals |
| [On-Chain Contracts](references/on-chain-contracts.md) | Full contract registry, TXIDs, ownership proof |
| [Terms of Use](references/terms-of-use.md) | Agreement-First Policy, IP rights, prohibitions |
| [Quantum Security](references/quantum-security.md) | **OWNER EYES ONLY** — Quantum-secure architecture, session keys, hedging, governance |
| [Master Strategy](references/master-strategy.md) | **CONFIDENTIAL** — Full economic strategy, revenue model, roadmap |

---

## On-Chain Proof of Ownership

| Evidence | Detail |
|----------|--------|
| STX Wallet | `SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW` |
| BTC Address | `bc1qdfm56pmmq40me84aau2fts3725ghzqlwf6ys7p` |
| BNS Name | `zaghmout.btc` |
| ERC-8004 | #54 on aibtc.com |
| WHALE Token | `SP322...whale-v3` |
| Bitflow Pool | Block 7492200, Pool #42 |
| Treasury | `SP322...whale-treasury-v1` — cf18e7d3... |
| Access Control | `SP322...whale-access-v1` — ea5c1719... |
| Arb Engine | `SP322...whale-arb-v1` — 8ff5e5e1... |
| ALEX Wrapper | `SP322...token-wwhale` — ed7ff923... block 7492645 |
| Explorer | https://explorer.hiro.so/address/SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW?chain=mainnet |

---

*Flying Whale — COPYRIGHT 2026. All systems, contracts, tokens, tools, agents, and intellectual property are the exclusive property of zaghmout.btc / ERC-8004 #54. Agreement-First Policy governs all interactions with this platform.*
