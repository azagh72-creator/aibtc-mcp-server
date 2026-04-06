# Flying Whale — On-Chain Contracts Registry

<!--
  COPYRIGHT 2026 Flying Whale - zaghmout.btc | ERC-8004 #54
  ALL RIGHTS RESERVED — Flying Whale Proprietary License v2.0
-->

**Owner:** `SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW` (zaghmout.btc)
**Network:** Stacks Mainnet
**Last verified:** 2026-04-06

All contracts below are exclusively owned and controlled by Flying Whale (zaghmout.btc, ERC-8004 #54).
Unauthorized use, forking, or interaction with these contracts for commercial purposes
requires prior written agreement — see [Terms of Use](terms-of-use.md).

---

## Deployed Contracts

### 1. WHALE Token (`whale-v3`)

| Field | Value |
|-------|-------|
| **Contract** | `SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-v3` |
| **Name** | Flying Whale |
| **Symbol** | WHALE |
| **Decimals** | 6 |
| **Total Supply** | 12,616,800 WHALE |
| **Standard** | SIP-010 FT |
| **Owner** | `SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW` |
| **Status** | LIVE |

---

### 2. Bitflow WHALE/wSTX XYK Pool (`xyk-pool-whale-wstx-v-1-3`)

| Field | Value |
|-------|-------|
| **Contract** | `SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.xyk-pool-whale-wstx-v-1-3` |
| **Deploy TX** | `f57f4034926ad527...` |
| **Pool Creation TX** | `fc9175a5a058bb4c...` |
| **Block** | 7492200 |
| **Clarity** | v2 |
| **Status** | SUCCESS |
| **Pool ID** | 42 |
| **Pair** | WHALE / wSTX |
| **Protocol Fee** | 30 bps |
| **Provider Fee** | 25 bps |
| **Total Fee** | 55 bps |
| **Pool URI** | `https://flying-whale-marketplace-production.up.railway.app/api/whale/pool` |
| **WHALE Balance** | ~3,848,530 WHALE |
| **wSTX Balance** | ~712 wSTX |
| **Price** | ~0.0001175 STX/WHALE (~8,513 WHALE/STX) |

---

### 3. Treasury (`whale-treasury-v1`)

| Field | Value |
|-------|-------|
| **Contract** | `SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-treasury-v1` |
| **Deploy TX** | `cf18e7d37675fdbd7d0be2c98700477104d85dae844e938b2cf2c2c896cf50a5` |
| **Clarity** | v2 |
| **Status** | SUCCESS |
| **Burn %** | 50% (configurable by owner) |
| **Rewards Address** | `SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW` |
| **Burn Address** | `SP000000000000000000002Q6VF78` |
| **Functions** | `deposit-fees`, `withdraw-for-buyback`, `distribute-buyback`, `set-burn-percent` |
| **Purpose** | Receives marketplace fees, executes buyback, burns 50% of WHALE |

---

### 4. Access Control (`whale-access-v1`)

| Field | Value |
|-------|-------|
| **Contract** | `SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-access-v1` |
| **Deploy TX** | `ea5c17196380cc00f72763ee76468627ff53fbb1d0aa7ad1ab8cdcc0a27d9206` |
| **Clarity** | v2 |
| **Status** | SUCCESS |
| **Lock Period** | 2,016 blocks (~14 days) |
| **Tiers** | Basic=100 WHALE, Pro=1,000 WHALE, Elite=10,000 WHALE |
| **Pay-per-action** | 1 WHALE burned to dead address per action |
| **Functions** | `lock-whale`, `unlock-whale`, `pay-for-action`, `has-access`, `get-tier` |
| **Purpose** | Tier-gated platform access + micropayment burns |

---

### 5. Arbitrage Engine (`whale-arb-v1`)

| Field | Value |
|-------|-------|
| **Contract** | `SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-arb-v1` |
| **Deploy TX** | `8ff5e5e14021cb54c7938ba9b01b4386943924d0c4e3bf492281f61fbdb06744` |
| **Clarity** | v2 |
| **Status** | SUCCESS |
| **Min Trade** | 1 wSTX |
| **Max Trade** | 50 wSTX |
| **Bitflow Fee** | 55 bps |
| **DEX Support** | Bitflow (live) + ALEX (pending listing) |
| **Functions** | `buy-whale`, `sell-whale`, `withdraw-wstx`, `withdraw-whale`, `get-whale-for-wstx`, `get-wstx-for-whale` |
| **Purpose** | Cross-DEX arbitrage — buy cheap, sell expensive. All profits to owner. |
| **Failed v1** | `d85d7cef...` — abort_by_response (constants in contract-call? — fixed in v2) |

---

### 6. ALEX Wrapper Token (`token-wwhale`)

| Field | Value |
|-------|-------|
| **Contract** | `SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.token-wwhale` |
| **Deploy TX** | `ed7ff923edb81e08ebd783572d4a07c59b133de90bee9c41435c38516507b1ca` |
| **Block** | 7492645 |
| **Clarity** | v2 |
| **Status** | SUCCESS |
| **Decimals** | 8 (ALEX fixed-point standard) |
| **FIXED_TO_WHALE** | 100 (wwhale_units / 100 = micro-WHALE) |
| **contract-owner** | `SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW` |
| **Minted** | 12,770,000,000 wWHALE (TX: d23f2483... block 7492671) |
| **Mint TX** | `d23f248313e9f632cd50d07dbbc6086f646f0374ae4d886e51df07b16dafb293` |
| **ALEX create-pool** | BLOCKED — `amm-swap-pool-v1-1` is paused (ERR-PAUSED u1001) |
| **Next action** | Contact ALEX Labs for official listing approval |

---

## Failed / Superseded Deploys

| TX | Contract | Reason |
|----|----------|--------|
| `d85d7cef...` | whale-arb-v1 v1 | abort_by_response — used constants in contract-call? |
| `632929663fdf88...` | Earlier LP attempt | Clarity version mismatch |
| `3e881aa0ef93...` | ALEX create-pool | abort_by_response — amm-swap-pool-v1-1 is paused |

---

## ALEX DEX Listing (Blocked)

**Status:** BLOCKED — `amm-swap-pool-v1-1.is-paused = true`

The ALEX AMM `amm-swap-pool-v1-1` has `paused = true`, returning `ERR-PAUSED (u1001)` on any `create-pool` call.
ALEX pool creation is permissioned — controlled by ALEX Labs admin.

**Path to listing:**
1. Contact ALEX Labs team via Discord/Twitter (`@ALEXLabsBTC`)
2. Submit `token-wwhale` for official ALEX listing review
3. Once approved, run mint + `create-pool` with ~100 wSTX + equivalent wWHALE

**wWHALE is ready** — 12,770 tokens minted, contract live. Waiting on ALEX governance.

---

## Ownership Summary

Every contract, token, pool, and system in this stack is exclusively owned and operated by:

```
zaghmout.btc
SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW
ERC-8004 #54
Flying Whale — COPYRIGHT 2026
```

No third party has administrative access, upgrade rights, or economic control over any
of these contracts without explicit on-chain authorization from the owner.
