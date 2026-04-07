# Flying Whale — Master Documentation
**Version:** 9.1.0
**Date:** 2026-04-07
**Classification:** Technical + Ownership + Legal
**COPYRIGHT 2026 Flying Whale — zaghmout.btc | ERC-8004 #54 — ALL RIGHTS RESERVED**

---

## 1. Identity & Ownership

| Field | Value |
|-------|-------|
| **Operator** | Flying Whale |
| **BNS Name** | `zaghmout.btc` |
| **ERC-8004 Identity** | `#54 — Genesis L2 Council` |
| **Stacks Address** | `SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW` |
| **Bitcoin Address** | `bc1qdfm56pmmq40me84aau2fts3725ghzqlwf6ys7p` |
| **Taproot Address** | `bc1pgpn6kcjcaa3a3ws2qnkkzqnm2t3s2srxy7yq9tda4s9l5y25mj3s5vzvua` |
| **GitHub** | `azagh72-creator` |
| **Nostr Pubkey** | `706d79a4c58f0e6310cf8e8e85a198e1c10f2fd6c82b07b209e76639a06b2217` |
| **Email** | `a.zagh72@gmail.com` |
| **Telegram** | `https://t.me/flyingwhale_stacks` |

### On-Chain Identity Proof
- **Registration TX:** `b7e2c3d8...` — whale-scoring-v1, block 7493476
- **Council Tier:** 485 points — all 9 activity flags active
- **IP Registry:** `whale-ip-store-v1` — 11 SHA-256 hashes registered TX `c5cccb46...`

---

## 2. Legal & License

### Flying Whale Proprietary License v2.0
**Effective:** April 5, 2026
**Licensor:** Flying Whale (zaghmout.btc | ERC-8004 #54 | SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW)

**AGREEMENT-FIRST POLICY:**
Any protocol, team, agent, or entity that uses, integrates, forks, references, or benefits from the Flying Whale Economic System, WHALE token, Sovereign Agent OS, or any of the 24 PGRM modules must enter a signed partnership agreement BEFORE using, not after.

**PROHIBITED WITHOUT LICENSE:**
- Forking, copying, or deploying any PGRM module
- Integrating WHALE token without written agreement
- Using Flying Whale brand, name, or identity
- Claiming AI output from the platform as proprietary

**PERMITTED:**
- Read-only API access via x402 micropayments
- Public marketplace skill browsing
- On-chain verification via `whale-verify-v1`

**ENFORCEMENT:**
Violations are documented on-chain via `whale-signal-registry-v1` and subject to legal action under applicable international IP law. On-chain proof hash: `af0f79c3c0db58a74728dd8c1aa831a02b4df987e4423ebe7eb8980d3a15307c`

### IP Registration
All PGRM modules (24 total), WHALE token contract, API endpoints, and documentation are registered in `whale-ip-store-v1` on Stacks mainnet. TX: `c5cccb46f055369b121b99c6c0c1ea98bf018d808b82aa271d89e028abf4e6c2`

---

## 3. WHALE Token

| Field | Value |
|-------|-------|
| **Name** | Flying Whale |
| **Symbol** | `WHALE` |
| **Standard** | SIP-010 (Stacks fungible token) |
| **Metadata** | SIP-016 compliant |
| **Contract** | `SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-v3` |
| **Decimals** | 6 |
| **Total Supply** | 1,000,000,000 WHALE |
| **Inflation** | None — fixed supply |
| **Team Reserve** | None — fully circulating |
| **Vesting** | None |
| **Burn Mechanism** | 1 WHALE per platform action via `whale-access-v1.pay-for-action` |
| **Buyback** | 50% of treasury fees → buyback → burn |

### Token Metadata (SIP-016)
- **URI Set TX:** `15c6b041f6fe1857a13c0caeb399bd55aff4ab6cf59c2a141280d558f6da1b79`
- **Metadata URL:** `https://raw.githubusercontent.com/azagh72-creator/aibtc-mcp-server/main/skills/flying-whale-marketplace/token/metadata.json`
- **Logo:** `https://raw.githubusercontent.com/azagh72-creator/aibtc-mcp-server/main/skills/flying-whale-marketplace/token/logo.svg`

### Exchange Listings
| Platform | Status | ID |
|----------|--------|----|
| Bitflow DEX | ✅ LIVE — Pool #42 | Block 7500763 |
| CoinGecko | ⏳ Submitted 2026-04-07 | CL0704260002 |
| CoinMarketCap | ⏳ Submitted 2026-04-07 | #1351355 |
| GeckoTerminal | ⏳ Awaiting Bitflow integration | — |
| DEXScreener | ⏳ Awaiting Bitflow integration | — |

### Liquidity Pool
- **Pair:** WHALE/wSTX
- **DEX:** Bitflow XYK
- **Pool ID:** 42
- **Pool Contract:** `SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.xyk-pool-whale-wstx-v-1-3`
- **Core Contract:** `SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.xyk-core-v-1-2`
- **Fee:** 55 bps (0.55%)
- **Deployment TX:** `cb15fed7a26e325fa333d849a4c2080aa4b51e7fe79cf99f49506d04fd93022b`
- **First Live Swap TX:** `cb31d7da62df052e56b32a4ca2a86290f8a64b7ae3e62c2fbef77c50f0bd42a7`
- **wSTX Address:** `SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.wstx` *(CRITICAL: use this, not wrapped-stx-token)*

---

## 4. Sovereign Agent OS — 8 Layers

| Layer | Contract | Description | Block | TX |
|-------|----------|-------------|-------|-----|
| 1 | `whale-scoring-v1` | Identity + Reputation | 7493476 | `707794da...` |
| 2 | `whale-v3` | Economy (WHALE SIP-010) | — | — |
| 3 | `whale-access-v1` | Execution (tier-gated) | — | — |
| 4 | `whale-governance-v1` | Governance (DAO) | — | — |
| 5 | `whale-ip-store-v1` | Memory (SHA-256 IP) | 7495384 | `c5cccb46...` |
| 6 | x402 API + Nostr | Voice (signed comms) | — | Railway |
| 7 | `whale-verify-v1` | Verification (composable gate) | — | `ab812a70...` |
| 8 | `whale-signal-registry-v1` | Audit Trail (on-chain signals) | 7501153 | `b6510119...` |

### Additional Contracts
| Contract | Purpose | TX |
|----------|---------|-----|
| `whale-treasury-v1` | Buyback engine | — |
| `whale-arb-v1` | Arbitrage | — |
| `token-wwhale` | Wrapped WHALE | — |
| `whale-router-v1` | Universal swap router | `cb15fed7...` (block 7500763) |
| `whale-gate-v1` | Agent access gate | `3b12575b...` (block 7500768) |
| `xyk-pool-whale-wstx-v-1-3` | Bitflow liquidity pool | block 7500763 |

---

## 5. Platform Architecture

```
Flying Whale Economic System v9.1.0
├── Sovereign Agent OS (8 layers, on Stacks mainnet)
├── Flying Whale Marketplace (https://flying-whale-marketplace-production.up.railway.app)
│   ├── 24 PGRM Modules
│   ├── 114 Skills across 11 categories
│   ├── Admin Command Center (/admin)
│   └── x402 paid analytics API
├── Whale Execution API (https://whale-execution-api-production.up.railway.app)
│   ├── 6 x402 paid endpoints
│   ├── Admin Dashboard (/admin)
│   └── v1.3.0
├── aibtc MCP Server (npm: @aibtc/mcp-server)
│   └── Flying Whale Marketplace Skill (PR #428)
└── On-chain Infrastructure
    ├── 12 smart contracts on Stacks mainnet
    ├── whale-signal-registry-v1 (dispute/audit trail)
    └── whale-ip-store-v1 (IP registration)
```

### PGRM Modules (24 total)
| ID | Module | Endpoints |
|----|--------|-----------|
| PGRM-01 | Risk Scoring Engine | 3 |
| PGRM-02 | Holder Analytics Engine | 3 |
| PGRM-03 | Loan Covenant Monitor | 4 |
| PGRM-04 | Intelligence Engine | 2 |
| PGRM-05 | Marketplace Engine | 7 |
| PGRM-06 | Order Book Engine | 3 |
| PGRM-07 | Bounty System | — |
| PGRM-08 | x402 Paid Analytics | — |
| PGRM-09 | Portfolio Tracker | — |
| PGRM-10 | Market Regime Detector | — |
| PGRM-11 | Contract Security Scanner | — |
| PGRM-12 | DeFi Yield Comparator | — |
| PGRM-13 | Whale Alert Monitor | — |
| PGRM-14 | ALDS — Autonomous Liquidation Defense | — |
| PGRM-15 | Subscriber Analytics Engine | — |
| PGRM-16 | Autonomous Hedge Fund Agent | — |
| PGRM-17 | FastPool Stacking Intelligence | — |
| PGRM-18 | Vault Strategy Engine | — |
| PGRM-19 | Meta Brain — Self-Evolving Intelligence | — |
| PGRM-20 | Strategy Matrix — Multi-Strategy Engine | — |
| PGRM-21 | Kill Switch — Emergency Protection | — |
| PGRM-22 | Execution Guard | — |
| PGRM-23 | Payment Gateway & Revenue Ledger | — |
| PGRM-24 | Capital Command Stack — Autonomous Smart Swap | — |

---

## 6. Security Architecture

### Known Vulnerabilities (Stacks Platform)
- **ALEX $8.3M Exploit (June 2025):** Clarity cannot detect failed-tx state in cross-contract calls. Halborn confirmed unpatched as of March 2026.
  - **Flying Whale Mitigation:** Token allowlists in all DeFi interactions. On-chain signal registered: TX `a07149f3...`
  - **Signal ID:** `alex-8.3m-clarity-failed-tx-unpatched-2026`

### Session Guard (MCPTox Protection)
- WeakMap-based per-session guard against MCP Overthinking Attacks (arxiv March 2026, adversa.ai)
- Hard cap: 20 wallet-sensitive calls per session
- Loop detection: 5 consecutive same-tool calls → block
- Rapid-fire detection: 8 calls in 10s → block

### x402 Payment Security
- All paid endpoints require valid x402 STX payment
- Relay: `https://x402-relay.aibtc.com`
- Ownership headers on all responses: `X-Fw-Owner`, `X-Fw-Identity`, `X-Fw-Registry`

---

## 7. News Signals & On-Chain Evidence

### Disputed Earnings (aibtc.news)
| Signal ID | Beat | Sats | Status |
|-----------|------|------|--------|
| `cdb65781` | distribution | 30,000 | payout_txid null since 2026-03-29 |
| `51945afc` | distribution | 30,000 | payout_txid null since 2026-03-29 |
| `18560a93` | distribution | 30,000 | payout_txid null since 2026-03-29 |

**Total disputed:** 90,000 sats
**On-chain proof:** `whale-signal-registry-v1` block 7501153 TX `b6510119...`
**Issue filed:** aibtcdev/agent-news#396
**PR #307 dispute:** Gates `brief_inclusions_30d` on `inscription_id IS NOT NULL` retroactively

### Filed Signals 2026-04-07
| Signal | Beat | TX |
|--------|------|----|
| Bitflow PR #211 | stacks-dev | earlier |
| whale-arb-v1 / agent-trading | agent-economy | scheduled |
| x402 API / agent-economy | agent-economy | scheduled |
| ALEX $8.3M Clarity exploit | stacks-dev | `a07149f3...` |
| PoX Cycle 133 zero commitments | stacks-dev | pending |

---

## 8. Scheduled Tasks (19 total)

| Task | Schedule | Purpose |
|------|----------|---------|
| whale-pox-presence | daily | PoX participation monitoring |
| whale-market-intelligence | daily | Market data collection |
| whale-lp-growth | daily | LP position tracking |
| whale-alex-listing | daily 09:41 | ALEX pool monitoring |
| whale-nostr-broadcast | daily 09:00 | Ecosystem broadcast |
| whale-burn-tracker | every 6h | Token burn tracking |
| whale-agent-recruitment | Monday 11:00 | Agent onboarding |
| whale-volume-maker | daily 08:00 + 20:00 | Volume generation |
| whale-dex-listing-push | Wednesday 10:00 | DEX listing outreach |
| whale-gate-monitor | daily 12:00 | Gate contract monitoring |
| whale-auto-swap | daily 08:10 + 20:10 | WHALE→wSTX auto-swap |
| whale-treasury-deposit | daily 08:23 | Treasury STX deposits |
| whale-news-signals | 06:30 UTC | News signal filing |
| whale-pr313-signal | one-time | Governance dispute signal |
| whale-swap-fix-test | one-time | Swap validation |
| whale-dex-outreach | one-time | Nostr DEX outreach |
| whale-pr312-signal | 2026-04-08 09:00 | PR #312 signal |
| whale-bip322-security-signal | 2026-04-08 10:30 | Security signal |
| whale-guard-v1 | 2026-04-08 06:00 | Guard contract deploy |

---

## 9. Key Milestones — 2026-04-07

| Milestone | TX / ID | Block |
|-----------|---------|-------|
| whale-router-v1 deployed | `cb15fed7...` | 7500763 |
| whale-gate-v1 deployed | `3b12575b...` | 7500768 |
| SIP-016 metadata on-chain | `15c6b041...` | — |
| WHALE→wSTX swap LIVE | `cb31d7da...` | — |
| whale-signal-registry-v1 | `b6510119...` | 7501153 |
| ALEX exploit signal on-chain | `a07149f3...` | — |
| CoinGecko submitted | CL0704260002 | — |
| CoinMarketCap submitted | #1351355 | — |
| Nostr verification (CG) | `701ca713...` | — |
| Nostr verification (CMC) | `27cbca34...` | — |

---

## 10. Access & Credentials

| Service | URL | Credentials |
|---------|-----|-------------|
| Marketplace | https://flying-whale-marketplace-production.up.railway.app | Admin: see Railway vars |
| Execution API | https://whale-execution-api-production.up.railway.app | x402 payments |
| Admin Dashboard | /admin (both services) | Railway: ADMIN_PASSWORD var |
| Railway Project | flying-whale-marketplace | railway CLI |
| GitHub | https://github.com/azagh72-creator/aibtc-mcp-server | git push |

---

## 11. Clarity Lessons Learned

1. `contract-call?` needs literal principals, not constants
2. `get-cached-score` on whale-scoring-v1 returns `uint128` directly — no `unwrap-panic`
3. Bitflow XYK swaps: use `SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.wstx` as y-token, NOT `wrapped-stx-token` (causes `err u2 ERR_INVALID_Y_TOKEN`)
4. Deploy contracts sequentially — parallel calls consume wallet session
5. Optional types in `call_contract`: avoid `(optional (string-ascii))` in public functions — use `(optional (buff 32))` or redesign
6. `deploy_contract` needs explicit `clarityVersion: 2` for optional map types

---

*COPYRIGHT 2026 Flying Whale — zaghmout.btc | ERC-8004 #54 | ALL RIGHTS RESERVED*
*Flying Whale Proprietary License v2.0 — Agreement-First Policy*
*On-chain IP proof: `whale-ip-store-v1` | `whale-signal-registry-v1`*
