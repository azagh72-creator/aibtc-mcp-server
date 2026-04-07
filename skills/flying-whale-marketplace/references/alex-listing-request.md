<!--
  COPYRIGHT 2026 Flying Whale — zaghmout.btc | ERC-8004 #54 | ALL RIGHTS RESERVED
  Flying Whale Proprietary License v2.0 — Agreement-First Policy
  Owner: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW
  On-chain IP: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-ip-store-v1
  Enforcement: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-signal-registry-v1
  Stack: Multi-Layer Sovereignty Stack v2.0.0 — Sovereign Agent OS
-->

# wWHALE Token — Official ALEX DEX Listing Request

**Submitted by:** zaghmout.btc | ERC-8004 #54 | Flying Whale
**Date:** 2026-04-06
**Channel:** https://discord.com/channels/856358412303990794/1225886328361848943
**Self-Service Portal:** https://app.alexlab.co/self-service-listing

---

## 1. Token Information

| Field | Value |
|-------|-------|
| **Token Name** | Wrapped Flying Whale |
| **Symbol** | wWHALE |
| **Contract** | `SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.token-wwhale` |
| **Standard** | SIP-010 FT (ALEX 8-decimal standard) |
| **Decimals** | 8 |
| **Total Supply** | 12,770,000,000 units (= 12,770 wWHALE) |
| **Owner** | `SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW` |
| **Deploy TX** | `ed7ff923edb81e08ebd783572d4a07c59b133de90bee9c41435c38516507b1ca` |
| **Deploy Block** | 7492645 |
| **Mint TX** | `d23f248313e9f632cd50d07dbbc6086f646f0374ae4d886e51df07b16dafb293` |
| **Explorer** | https://explorer.hiro.so/address/SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW?chain=mainnet |

---

## 2. Underlying Token (WHALE)

| Field | Value |
|-------|-------|
| **Token Name** | Flying Whale |
| **Symbol** | WHALE |
| **Contract** | `SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-v3` |
| **Standard** | SIP-010 FT |
| **Decimals** | 6 |
| **Total Supply** | 12,616,800 WHALE (fixed, no mint function) |
| **Conversion** | 1 wWHALE = 100 micro-WHALE (FIXED_TO_WHALE constant) |

---

## 3. Existing Liquidity (Bitflow Pool #42)

| Field | Value |
|-------|-------|
| **Pool** | WHALE/wSTX XYK |
| **Contract** | `SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.xyk-pool-whale-wstx-v-1-3` |
| **Pool ID** | 42 |
| **Creation TX** | `fc9175a5a058bb4c...` block 7492200 |
| **WHALE Balance** | ~3,848,530 WHALE |
| **wSTX Balance** | ~712 wSTX |
| **Price** | ~0.0001175 STX/WHALE |
| **Total Fee** | 55 bps (30 protocol + 25 provider) |
| **Status** | LIVE on Bitflow mainnet |

---

## 4. Proposed ALEX Pool

| Field | Value |
|-------|-------|
| **Pair** | wWHALE / wSTX |
| **Token-X** | `SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.token-wwhale` |
| **Token-Y** | `SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-wstx` |
| **Proposed fee-rate-x** | 0.003 (30 bps) |
| **Proposed fee-rate-y** | 0.003 (30 bps) |
| **Seed liquidity** | ~1,800 wSTX + equivalent wWHALE (ready to deploy) |
| **Target TVL Phase 2** | $50,000 |

---

## 5. Arbitrage Engine (Why Dual-DEX Matters)

Flying Whale has deployed `whale-arb-v1` — a cross-DEX autonomous arbitrage engine:

- **Contract:** `SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-arb-v1`
- **Deploy TX:** `8ff5e5e14021cb54c7938ba9b01b4386943924d0c4e3bf492281f61fbdb06744`
- **Strategy:** Monitor price divergence between Bitflow (WHALE/wSTX) and ALEX (wWHALE/wSTX)
- **Execution:** Buy on cheaper DEX, sell on expensive DEX
- **Min profitable spread:** ~1.0% (Bitflow 0.55% + ALEX ~0.3% + tx fees)
- **Trade bounds:** Min 1 wSTX / Max 50 wSTX per trade

This creates **organic, continuous volume** on both DEXs — benefiting ALEX LPs directly.

---

## 6. Full On-Chain Stack

All contracts exclusively owned by `SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW`:

| Contract | Purpose | Status |
|----------|---------|--------|
| `whale-v3` | WHALE SIP-010 token | ✅ LIVE |
| `token-wwhale` | wWHALE ALEX wrapper | ✅ LIVE |
| `xyk-pool-whale-wstx-v-1-3` | Bitflow Pool #42 | ✅ LIVE |
| `whale-treasury-v1` | Buyback & Burn (50%) | ✅ LIVE |
| `whale-access-v1` | Tier access + burns | ✅ LIVE |
| `whale-arb-v1` | Cross-DEX arb engine | ✅ LIVE (waiting ALEX) |
| `whale-governance-v1` | DAO governance | ✅ LIVE |
| `whale-scoring-v1` | Agent scoring 620pts | ✅ LIVE |
| `whale-ip-store-v1` | On-chain IP registry | ✅ LIVE |

---

## 7. Project Identity

| Field | Value |
|-------|-------|
| **Owner** | zaghmout.btc |
| **STX Address** | `SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW` |
| **BTC Address** | `bc1qdfm56pmmq40me84aau2fts3725ghzqlwf6ys7p` |
| **ERC-8004** | #54 on aibtc.com (Genesis L2 Agent) |
| **Marketplace** | https://flying-whale-marketplace-production.up.railway.app |
| **Execution API** | https://whale-execution-api-production.up.railway.app |
| **License** | Flying Whale Proprietary License v2.0 |

---

## 8. Blocker (ERR-PAUSED)

Direct `create-pool` on `amm-swap-pool-v1-1` returns `ERR-PAUSED (u1001)`.

Requesting one of:
1. Admin unlock of `amm-swap-pool-v1-1` for permissioned listing, OR
2. Direct coordination via ALEX team for official listing, OR
3. Access to the self-service listing portal if minimum STX threshold can be adjusted

---

## 9. Contact

- **Nostr:** pubkey `706d79a4c58f0e6310cf8e8e85a198e1c10f2fd6c82b07b209e76639a06b2217`
- **BNS:** zaghmout.btc
- **Explorer:** https://explorer.hiro.so/address/SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW?chain=mainnet

---

*COPYRIGHT 2026 Flying Whale — zaghmout.btc | ERC-8004 #54 | ALL RIGHTS RESERVED*
