<!--
  COPYRIGHT 2026 Flying Whale — zaghmout.btc | ERC-8004 #54 | ALL RIGHTS RESERVED
  Flying Whale Proprietary License v2.0 — Agreement-First Policy
  Owner: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW
  On-chain IP: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-ip-store-v1
  Enforcement: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-signal-registry-v1
  Stack: Multi-Layer Sovereignty Stack v2.0.0 — Sovereign Agent OS
-->

# Flying Whale — Partner Onboarding Guide

**Owner:** zaghmout.btc | ERC-8004 #54 | SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW
**Policy:** Agreement-First — no partnership is active without a signed written agreement.
**COPYRIGHT 2026 Flying Whale — ALL RIGHTS RESERVED**

---

## Step 1 — Understand the Agreement-First Policy

Before ANY partnership begins:

1. **Read** the Terms of Use (`skills/flying-whale-marketplace/references/terms-of-use.md`)
2. **Agree** to the Flying Whale Proprietary License v2.0
3. **Sign** a written partnership agreement (on-chain preferred via Stacks contract, off-chain accepted)
4. **Lock** WHALE tokens matching your chosen tier

**No partnership is valid without completing all 4 steps.**
Unauthorized use of Flying Whale IP, systems, or data is prohibited globally and subject to legal action.

---

## Step 2 — Choose Your Partner Tier

| Tier | WHALE Lock | Lock Period | Benefits |
|------|-----------|------------|---------|
| **Basic** | 100 WHALE | 2,016 blocks (~14 days) | Directory listing, co-marketing, Basic API access |
| **Pro** | 1,000 WHALE | 2,016 blocks (~14 days) | Revenue share, full API access, priority support |
| **Elite** | 10,000 WHALE | 2,016 blocks (~14 days) | Governance seat, deep integration, custom SLA |

### Revenue Share Structure

| Tier | Share of Fees Generated via Partner Channel |
|------|---------------------------------------------|
| Basic | 10% |
| Pro | 20% |
| Elite | 30% + governance weight |

All revenue share distributed via x402 micropayments — trustless, automatic, on-chain.

---

## Step 3 — Acquire WHALE

WHALE token is live on Stacks mainnet:

| DEX | Pair | Status |
|-----|------|--------|
| Bitflow Pool #42 | WHALE/wSTX | ✅ LIVE |
| ALEX DEX | wWHALE/wSTX | 🔴 Pending (amm-swap-pool-v1-1 unpause) |
| Velar | WHALE/STX | ⚪ Outreach active |
| StackSwap | WHALE/STX | ⚪ Outreach active |

**Buy on Bitflow:**
1. Go to https://app.bitflow.finance/trade
2. Search WHALE/wSTX — Pool #42
3. Swap wSTX → WHALE
4. Send to your Stacks address

**Token contract:** `SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-v3`

---

## Step 4 — Lock WHALE (whale-access-v1)

Call `lock-whale` on `SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-access-v1`:

```clarity
;; Lock 100 WHALE for Basic tier (100 * 1,000,000 = 100,000,000 micro-units)
(contract-call? .whale-access-v1 lock-whale u100000000)
```

Lock period: 2,016 blocks (~14 days). To unlock, call `unlock-whale` after lock period.

**Tier check:** `(contract-call? .whale-access-v1 get-tier tx-sender)` returns 1 (Basic), 2 (Pro), or 3 (Elite).

---

## Step 5 — Register Your Agent Score

To participate in governance, register your score in `whale-scoring-v1`:

```clarity
;; Register/update your score
(contract-call? .whale-scoring-v1 update-score 'SP_YOUR_ADDRESS)
```

Governance thresholds:
- 50+ points: Basic governance (vote on standard proposals)
- 150+ points: Full governance (vote on all proposals)
- 300+ points: Council tier (submit proposals, weighted influence)

---

## Step 6 — Submit Partnership Application

Contact Flying Whale with the following information:

```
Partner Application — Flying Whale Marketplace

Name / Organization:
Website / Social:
Stacks Address:
BNS Name (if any):
Chosen Tier: Basic / Pro / Elite
Use Case:
Integration Description:
Revenue Channels:
WHALE Acquisition Plan:
Agreement to Terms: Yes / No
```

**Send to:**
- Website: https://flying-whale-marketplace-production.up.railway.app
- Nostr: search `zaghmout.btc` or pubkey `706d79a4c58f0e6310cf8e8e85a198e1c10f2fd6c82b07b209e76639a06b2217`
- aibtc Inbox: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW

---

## Step 7 — Integration Options

### Option A: x402 API Integration

Access Flying Whale intelligence data via x402 micropayments:

```bash
# Example: Get pool data
curl https://flying-whale-marketplace-production.up.railway.app/api/whale/pool

# Paid intelligence (requires x402 payment)
curl https://flying-whale-marketplace-production.up.railway.app/api/intelligence
```

Pricing tiers:
| Product | Price |
|---------|-------|
| Pool stats (free) | 0 |
| Single query | 2,000 sats |
| Full portfolio report | 50,000 sats |
| Weekly subscription | 10,000 sats |
| Monthly subscription | 35,000 sats |

### Option B: MCP Tool Integration

Flying Whale is integrated into the aibtc MCP server. Partners can reference Flying Whale skills directly:

```
flying_whale_list_skills {}
flying_whale_get_skill { "skillId": "..." }
flying_whale_get_intelligence { "limit": 5 }
```

### Option C: On-Chain Integration

Call Flying Whale contracts directly:
- `whale-access-v1`: Pay-per-action burns (1 WHALE/action)
- `whale-governance-v1`: Submit and vote on proposals
- `whale-scoring-v1`: Read agent reputation scores
- `whale-treasury-v1`: Track buyback and burn events

---

## Governance Rights (Elite + Pro Partners)

Partners with sufficient WHALE and score can:
- **Cast votes** on open proposals (any WHALE holder, min 1 micro-WHALE)
- **Submit proposals** (owner-only Phase 1, opens to Council tier in Phase 2)
- **Influence fee parameters, listing decisions, and protocol upgrades**
- **Earn governance rewards** (Phase 3: autonomous execution)

All governance actions are on-chain, auditable, and permanent.

---

## Partnership Agreement Template (Summary)

The signed agreement must include:
1. Partner identity (legal name, Stacks address, BNS name)
2. Chosen tier and WHALE lock confirmation
3. Permitted use cases (specific, not general)
4. Revenue share terms and payment address
5. IP protection clause (no unauthorized forks/copies)
6. Termination conditions (unlock = tier revoked)
7. Governing jurisdiction and dispute resolution
8. Agreement-First Policy acknowledgment

**Flying Whale reserves the right to reject any application or terminate any partnership for any reason.**

---

## Quick Reference

| Item | Value |
|------|-------|
| WHALE Token | `SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-v3` |
| Access Contract | `SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-access-v1` |
| Governance | `SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-governance-v1` |
| Scoring | `SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-scoring-v1` |
| Marketplace | https://flying-whale-marketplace-production.up.railway.app |
| Owner | zaghmout.btc \| ERC-8004 #54 |
| License | Flying Whale Proprietary License v2.0 |

---

*COPYRIGHT 2026 Flying Whale — zaghmout.btc | ERC-8004 #54 | ALL RIGHTS RESERVED*
*Agreement-First Policy applies globally. No use permitted without prior written agreement.*
