# Flying Whale — DEX Listing Outreach

<!--
  COPYRIGHT 2026 Flying Whale - zaghmout.btc | ERC-8004 #54
  ALL RIGHTS RESERVED — Flying Whale Proprietary License v2.0
-->

**Owner:** zaghmout.btc | SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW
**Status:** Active outreach — multi-DEX global listing campaign

---

## ALEX Labs — wWHALE/wSTX Pool

**Status:** READY — token deployed, funds ready, waiting on amm-swap-pool-v1-1 unpause

### Token Details
| Field | Value |
|-------|-------|
| Token | `SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.token-wwhale` |
| Symbol | wWHALE |
| Decimals | 8 (ALEX standard) |
| Supply minted | 12,770,000,000 units |
| Backed by | WHALE token (whale-v3, 6 decimals, 12,616,800 supply) |
| Conversion | 100 wWHALE units = 1 micro-WHALE |
| Pair target | wWHALE / wSTX |

### Tweet Draft (@ALEXLabsBTC)
```
Hey @ALEXLabsBTC team 👋

I've built the full wWHALE token (ERC-20 compatible wrapper for WHALE)
ready for ALEX listing:
• Contract: SP322...token-wwhale ✅
• 12,770,000,000 units minted ✅
• wWHALE/wSTX pair ready to seed ✅

The amm-swap-pool-v1-1 is currently paused.
Could we discuss getting WHALE listed officially?

zaghmout.btc | Flying Whale Marketplace
#Stacks #Bitcoin #DeFi
```

### Discord Message (ALEX Labs server)
```
Hi ALEX team,

I've deployed the wWHALE wrapper token for the Flying Whale Marketplace
and would like to list it on ALEX DEX.

Contract: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.token-wwhale
Decimals: 8 (standard ALEX format)
Minted: 12,770,000,000 wWHALE → ready to seed wWHALE/wSTX pool
Explorer: https://explorer.hiro.so/address/SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.token-wwhale

The WHALE token powers the Flying Whale Marketplace — 114 AI agent skills,
on-chain governance, and x402 micropayments.
Website: https://flying-whale-marketplace-production.up.railway.app

I attempted create-pool but hit ERR-PAUSED (u1001) on amm-swap-pool-v1-1.
Could you help us get listed?

Thanks,
zaghmout.btc | ERC-8004 #54
```

**Channels:**
- Twitter/X: @ALEXLabsBTC
- Discord: discord.gg/alexlab → #token-listing or #support
- Email: team@alexgo.io (if available)

---

## Velar — WHALE/STX Pool

**Status:** Application ready

### Token Details
| Field | Value |
|-------|-------|
| Token | `SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-v3` |
| Symbol | WHALE |
| Decimals | 6 |
| Total Supply | 12,616,800 |
| Pair target | WHALE / STX |
| Website | https://flying-whale-marketplace-production.up.railway.app |

### Velar Listing Message
```
Hi Velar team,

I'd like to list the WHALE token on Velar DEX.

Token: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-v3
Symbol: WHALE | Decimals: 6 | Supply: 12,616,800 (fixed, no inflation)
Current pool: Bitflow WHALE/wSTX Pool #42 (~$1,100 TVL)
Governance: whale-governance-v1 on-chain (DAO proposals + weighted voting)

Flying Whale Marketplace powers 114 AI agent skills on Stacks.
WHALE burns with every platform action — deflationary model.

Would love to add WHALE/STX liquidity on Velar.
zaghmout.btc | ERC-8004 #54
```

**Channel:** velar.co → Community / Discord / listing form

---

## StackSwap

### Listing Message
```
Hey StackSwap team,

WHALE token listing request:
• Contract: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-v3
• Symbol: WHALE | Decimals: 6 | Fixed supply: 12,616,800
• Use case: Flying Whale Marketplace — AI skills, governance, micropayments
• Deflationary: burns on every platform action

Currently live on Bitflow Pool #42.
Would like WHALE/STX on StackSwap as well.
zaghmout.btc
```

**Channel:** app.stackswap.org → Discord / listing request

---

## Charisma

### Listing Message
```
Hi Charisma team,

Requesting WHALE token listing:
Contract: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-v3
Decimals: 6 | Supply: 12,616,800 | Fixed (no mint)

WHALE powers Flying Whale Marketplace — 114 AI agent skills on Stacks.
On-chain governance (whale-governance-v1) active.
zaghmout.btc | ERC-8004 #54
```

**Channel:** charisma.rocks → Discord

---

## Tracking

| DEX | Status | Contacted | Response |
|-----|--------|-----------|---------|
| Bitflow | ✅ LIVE — Pool #42 | Built pool ourselves | Active |
| ALEX | 🔴 BLOCKED (paused) | Not yet — ready to send | Pending |
| Velar | ⚪ Not listed | Not yet — ready to send | Pending |
| StackSwap | ⚪ Not listed | Not yet — ready to send | Pending |
| Charisma | ⚪ Not listed | Not yet — ready to send | Pending |

**Autopilot monitors:** whale-autopilot.mjs polls ALEX amm-swap-pool-v1-1 every 5min.
When unpaused → auto-alerts → create-pool transaction ready to fire.

---

*COPYRIGHT 2026 Flying Whale — zaghmout.btc | ERC-8004 #54 | ALL RIGHTS RESERVED*
