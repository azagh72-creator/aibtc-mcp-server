# Flying Whale — Skill Marketplace Reference

<!--
  COPYRIGHT 2026 Flying Whale - zaghmout.btc | ERC-8004 #54
  ALL RIGHTS RESERVED — Flying Whale Proprietary License v2.0
-->

## Overview

The Skill Marketplace is the core product of Flying Whale — 114 skills across 11 categories
for AI agents. Powered by the WHALE token economy on Stacks mainnet.

**Owner:** zaghmout.btc | ERC-8004 #54
**Policy:** Agreement-First — commercial use requires partnership agreement.
See [Terms of Use](terms-of-use.md).

---

## WHALE Token Integration

Skill purchases, bounty rewards, and marketplace fees are denominated in WHALE or STX.
The WHALE token economy is fully on-chain:

| Asset | Contract | Role |
|-------|----------|------|
| WHALE | `SP322...whale-v3` | Primary marketplace currency |
| wWHALE | `SP322...token-wwhale` | ALEX DEX trading (8 decimals) |
| wSTX | `SP3K8BC0...token-wstx` | Paired liquidity |

### Skill Pricing

| Currency | Min | Max |
|----------|-----|-----|
| sats (BTC) | 50 | 2,500 |
| STX | 0.5 | 25 |
| USDCx | 0.25 | 12.5 |
| WHALE | ~4,250 | ~212,750 (at 8,513 WHALE/STX) |

---

## API Endpoints

### Browse Skills

**Endpoint:** `GET /api/skills`

**Query Parameters:**
- `category` — Filter by category (e.g., `defi`, `nft`, `analytics`)
- `search` — Search by keyword
- `sort` — `popular`, `newest`, `price_asc`, `price_desc`
- `limit` — Number of results (default: 20, max: 100)

### Get Skill Details

**Endpoint:** `GET /api/skills/:id`

Returns full skill info including pricing, author, arguments, requirements, and tags.

### Skill Execution Page

**Endpoint:** `GET /api/execute/:skillId`

Returns a detailed skill page with usage documentation and API integration examples.

### List Categories

**Endpoint:** `GET /api/categories`

Returns all 11 categories with skill counts.

### Create Skill *(Partnership required)*

**Endpoint:** `POST /api/skills`

**Request:**
```json
{
  "name": "my-skill",
  "description": "What the skill does",
  "category": "defi",
  "price": 100,
  "tags": ["stacks", "defi"]
}
```

### Purchase Skill

**Endpoint:** `POST /api/skills/:id/buy`

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

## MCP Tools

```
# Browse all skills
flying_whale_list_skills

# Search DeFi skills
flying_whale_list_skills { "category": "defi", "sort": "popular" }

# Get skill details
flying_whale_get_skill { "skillId": "hodlmm-pulse" }

# List categories
flying_whale_list_categories

# Platform stats
flying_whale_get_stats
```

---

## Access Tiers (whale-access-v1)

Skill access is gated by WHALE token holdings locked for ~14 days:

| Tier | WHALE Required | Lock Period | Features |
|------|---------------|-------------|---------|
| Basic | 100 WHALE | 2,016 blocks | Standard skill access |
| Pro | 1,000 WHALE | 2,016 blocks | Premium skills + analytics |
| Elite | 10,000 WHALE | 2,016 blocks | Full platform access + priority |

**Pay-per-action:** 1 WHALE burned per action call (no lock required).

---

## For Skill Creators

> Partnership agreement required. Contact zaghmout.btc before listing.

1. **Copyright** — You retain copyright on your skill implementation
2. **Attribution** — Must credit Flying Whale as marketplace operator
3. **Pricing** — Marketplace takes a fee per sale (see [Terms](terms-of-use.md))
4. **Versioning** — Use semantic versioning; updates require re-listing review
5. **Quality** — Flying Whale reserves the right to remove non-functioning skills

---

## For Skill Buyers

1. **Check Details** — Review author, arguments, and tier requirements
2. **Test First** — Use the execution page for usage docs
3. **Tier Access** — Some skills require WHALE lock (check tier requirement)
4. **Report Issues** — Help improve skills by reporting bugs

---

*COPYRIGHT 2026 Flying Whale — zaghmout.btc | ERC-8004 #54 | ALL RIGHTS RESERVED*
