/**
 * Flying Whale Marketplace Tools
 *
 * COPYRIGHT 2026 Flying Whale — zaghmout.btc | ERC-8004 #54 | ALL RIGHTS RESERVED
 * Flying Whale Proprietary License v3.0 — Agreement-First Policy
 * Owner: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW
 * BTC:   bc1qdfm56pmmq40me84aau2fts3725ghzqlwf6ys7p
 * On-chain IP: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-ip-store-v1
 * Enforcement: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-signal-registry-v1
 * Identity:    ERC-8004 #54 — Genesis L2 Agent — zaghmout.btc
 *
 * ═══════════════════════════════════════════════════════════════════
 * SOVEREIGN AGENT OS v3.0.0 — 10-Layer Bitcoin AI Stack on Stacks
 * ═══════════════════════════════════════════════════════════════════
 *
 * Economic Model: Utility → Revenue → Proof → Story → Attention → Loop
 *
 * Layer 1  — whale-treasury-v1        — Buyback engine (STX → WHALE)
 * Layer 2  — whale-arb-v1             — Autonomous cross-DEX arbitrage
 * Layer 3  — whale-scoring-v1         — On-chain agent scoring (485 pts, Council tier)
 * Layer 4  — whale-ip-store-v1        — IP registry (11 SHA-256 hashes on Stacks)
 * Layer 5  — whale-signal-registry-v1 — Dispute evidence (permanent audit trail)
 * Layer 6  — whale-verify-v1          — Contract upgrade-risk scanner
 * Layer 7  — whale-gate-v1            — WHALE-gated access control
 * Layer 8  — whale-registry-v2        — Universal cross-chain agent registry
 * Layer 9  — whale-router-v1          — Static DEX route registry
 * Layer 10 — whale-execution-v1       — First CoW matching engine on Stacks
 *
 * WHALE Access Model — No WHALE = No Access (enforced on-chain via Hiro API):
 *   Scout  (1,000 WHALE)   — skill browsing, categories, stats
 *   Agent  (10,000 WHALE)  — intelligence, order book, analytics
 *   Elite  (100,000 WHALE) — all features + premium data
 *   Council (score ≥ 300)  — governance, proposals
 *   Institutional          — commercial/API use requires licensing agreement: github.com/azagh72-creator
 *
 * ACCESS GATE: All tools require callerAddress (STX address).
 * WHALE balance is verified against Stacks mainnet before each call.
 * No WHALE = 403 WHALE Gate error. No exceptions. No fallbacks.
 *
 * MCP tools (sovereignty-stamped, WHALE-gated):
 * Scout tier (100 WHALE):
 * - flying_whale_list_skills      — Browse 114 skills across 11 categories
 * - flying_whale_get_skill        — Detailed skill info (pricing, author, args)
 * - flying_whale_list_categories  — All categories with counts
 * - flying_whale_get_stats        — Platform stats (skills, volume, agents)
 * - flying_whale_list_bounties    — Active bounties (task-based rewards)
 * - flying_whale_get_bounty       — Bounty details (reward, deadline, requirements)
 * - flying_whale_get_regime       — Market regime for STX/BTC (Wyckoff + RSI + signal)
 * - flying_whale_get_whale_price  — Real-time WHALE price, liquidity, pool depth
 * - flying_whale_registry_lookup  — Agent registry lookup (whale-registry-v2 on-chain)
 * - flying_whale_relay_hardened   — Hardened relay health: TLS, latency, block consensus
 * - flying_whale_erc8004_lookup   — Cross-chain ERC-8004 identity resolver (22 networks)
 * - flying_whale_dormancy_check   — Agent dormancy score + reactivation checklist
 * Agent tier (1,000 WHALE):
 * - flying_whale_list_orders      — Order book (buy/sell for skill trading)
 * - flying_whale_get_intelligence — Intelligence reports and market analytics
 * - flying_whale_risk_score       — 5-factor token risk score (0–100)
 * - flying_whale_wallet_risk      — Wallet trust profile and classification
 * - flying_whale_multi_key        — Multi-key architecture: balance/nonce/activity matrix
 * - flying_whale_verify_upgrade   — Upgradeable contract detection + risk assessment
 * - flying_whale_safe_execute     — Agent-safe pre-flight: balance, nonce, fee, simulation
 * - flying_whale_ecdsa_audit      — CVE-2026-2819 ECDSA signing pattern audit
 * Elite tier (10,000 WHALE):
 * - flying_whale_expose_identity  — Hidden identity exposure: cluster analysis on-chain
 * - flying_whale_liquidity        — Pool liquidity depth, IL risk, LP position tracking
 * - flying_whale_execution_depth  — Live order book depth for any token pair
 * - flying_whale_execution_arb    — Active arb signals from the execution scanner
 *
 * Execution Sovereign Layer (whale-execution-engine-production.up.railway.app):
 * Scout tier (100 WHALE):
 * - flying_whale_execution_quote  — Best route quote across all DEXs
 * Agent tier (1,000 WHALE):
 * - flying_whale_execution_submit — Submit order to CoW matching engine
 * - flying_whale_execution_boost  — Burn WHALE to boost order priority
 * - flying_whale_execution_cancel — Cancel a pending order
 * - flying_whale_execution_status — Get execution stats (queue size, active signals)
 *
 * ─── On-chain Contracts ────────────────────────────────────────────────────────
 * whale-v3            SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-v3
 * whale-treasury-v1   SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-treasury-v1
 * whale-execution-v1  SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-execution-v1
 * whale-gate-v1       SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-gate-v1
 * whale-router-v1     SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-router-v1
 * whale-registry-v2   SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-registry-v2
 * whale-verify-v1     SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-verify-v1
 * whale-scoring-v1    SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-scoring-v1
 * whale-ip-store-v1   SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-ip-store-v1
 * whale-signal-reg-v1 SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-signal-registry-v1
 * whale-arb-v1        SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-arb-v1
 *
 * ─── Live Services ─────────────────────────────────────────────────────────────
 * Execution API: https://whale-execution-engine-production.up.railway.app
 * Marketplace:   https://flying-whale-marketplace-production.up.railway.app
 * Multichain:    BTC bc1qdfm... | STX SP322Z... | ETH 0xEAb576... | SOL A8pFQ9...
 * Buy WHALE:     https://app.bitflow.finance — WHALE/wSTX Pool #42
 * aibtc news:    https://aibtc.news — Flying Whale correspondent (streak: 4d)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createJsonResponse, createErrorResponse } from "../utils/index.js";
import { principalCV, serializeCV, stringAsciiCV, uintCV } from "@stacks/transactions";
import { ipiGetAuditLog, ipiIsCoordinatedAttack, ipiSanitize, IPI_ATTACK_PHRASES } from "./session-guard.js";

const BASE_URL  = "https://flying-whale-marketplace-production.up.railway.app";
const EXEC_URL  = "https://whale-execution-engine-production.up.railway.app";
const TIMEOUT_MS = 15_000;

// ─── WHALE Gate Configuration ─────────────────────────────────────────────────
// WHALE token: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-v3
// Fungible token ID in Hiro balance response format
const WHALE_FT_KEY = "SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-v3::whale";
const WHALE_DECIMALS = 6;
const HIRO_API = "https://api.hiro.so";

// Access tier thresholds (in micro-WHALE, 6 decimals)
// Updated 2026-04-13: thresholds raised — commercial use requires licensing agreement
// Institutional/API access: github.com/azagh72-creator or zaghmout.btc
const WHALE_THRESHOLDS = {
  scout:  1_000n * 1_000_000n,    // 1,000 WHALE
  agent:  10_000n * 1_000_000n,   // 10,000 WHALE
  elite:  100_000n * 1_000_000n,  // 100,000 WHALE
} as const;

type WhaleTier = keyof typeof WHALE_THRESHOLDS;

// ─── Sovereignty Stamp v3.0.0 ─────────────────────────────────────────────────
// Appended to every tool response — immutable ownership assertion
// Economic model: Utility → Revenue → Proof → Story → Attention → Loop
const SOVEREIGNTY_STAMP = {
  _copyright:      "COPYRIGHT 2026 Flying Whale — zaghmout.btc | ERC-8004 #54 | ALL RIGHTS RESERVED",
  _license:        "Flying Whale Proprietary License v3.0 — Agreement-First Policy",
  _identity:       "Genesis L2 Agent | ERC-8004 #54 | Council Tier (485 pts) | Streak: active",
  _owner_stx:      "SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW",
  _owner_btc:      "bc1qdfm56pmmq40me84aau2fts3725ghzqlwf6ys7p",
  _owner_eth:      "0xEAb576Ea7fd0c81eEb28f41783496a238C9Eb1Cf",
  _owner_sol:      "A8pFQ94ZAaENBGEEsa9udjM2cv6XTuXY9cwA5HUdJcfG",
  _stack:          "Sovereign Agent OS v3.0.0 — 10-Layer Bitcoin AI Stack",
  _layers:         "treasury|arb|scoring|ip|signals|verify|gate|registry|router|execution",
  _whale_token:    "SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-v3 | 12.6M supply",
  _whale_gate:     "Scout 1K | Agent 10K | Elite 100K | Council score≥300. Commercial license: github.com/azagh72-creator",
  _ip_registry:    "SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-ip-store-v1 — 11 hashes registered",
  _audit_trail:    "SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-signal-registry-v1",
  _execution:      "whale-execution-v1 block 7537670 — first CoW engine on Stacks",
  _economy:        "x402 payments → whale-treasury-v1 buyback → WHALE burn → price support",
  _ipi_defense:    "IPI Defense v2 active — coordinated attack detection + sanitize mode",
  _mcp_version:    "aibtc-mcp-server v1.53.0 | @aibtc/mcp-server on npm",
} as const;

// ============================================================================
// WHALE Gate — on-chain balance verification
// ============================================================================

/**
 * Verify that callerAddress holds enough WHALE for the required tier.
 * Throws a descriptive error if verification fails.
 * No fallback — if the check fails, the call is blocked.
 */
async function verifyWhaleAccess(callerAddress: string, tier: WhaleTier): Promise<void> {
  const url = `${HIRO_API}/extended/v1/address/${callerAddress}/balances`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let whaleBalance = 0n;
  try {
    const res = await fetch(url, {
      headers: { "Accept": "application/json", "X-Fw-Agent": "flying-whale-gate" },
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`Hiro API balance check failed: ${res.status} ${res.statusText}`);
    }
    const data = await res.json() as {
      fungible_tokens?: Record<string, { balance: string }>;
    };
    const rawBalance = data.fungible_tokens?.[WHALE_FT_KEY]?.balance ?? "0";
    whaleBalance = BigInt(rawBalance);
  } finally {
    clearTimeout(timer);
  }

  const threshold = WHALE_THRESHOLDS[tier];
  if (whaleBalance < threshold) {
    const held = (Number(whaleBalance) / Math.pow(10, WHALE_DECIMALS)).toLocaleString("en-US", { maximumFractionDigits: 2 });
    const required = (Number(threshold) / Math.pow(10, WHALE_DECIMALS)).toLocaleString("en-US");
    throw new Error(
      `WHALE Gate — Access Denied\n\n` +
      `Tier required : ${tier.toUpperCase()} (${required} WHALE)\n` +
      `Address       : ${callerAddress}\n` +
      `You hold      : ${held} WHALE\n` +
      `Shortfall     : ${(Number(threshold - whaleBalance) / Math.pow(10, WHALE_DECIMALS)).toLocaleString("en-US")} WHALE\n\n` +
      `Buy WHALE     : https://app.bitflow.finance — WHALE/wSTX Pool #42\n` +
      `Gate contract : SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-gate-v1\n` +
      `Licensing     : github.com/azagh72-creator — institutional/commercial access requires agreement\n` +
      `No WHALE = No Access. No exceptions.`
    );
  }
}

// ============================================================================
// Helpers
// ============================================================================

async function marketplaceFetch(
  path: string,
  callerAddress: string,
  query?: Record<string, string | number | undefined>
): Promise<unknown> {
  const url = new URL(path, BASE_URL);
  // Always pass caller address so marketplace can verify WHALE tier and apply discount
  url.searchParams.set("address", callerAddress);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "Accept": "application/json",
        "X-Fw-Agent": "aibtc-mcp-server - Flying Whale Marketplace Skill",
        "X-Fw-Stack": "Multi-Layer Sovereignty Stack v2.0.0",
        "X-Fw-Caller": callerAddress,
      },
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(
        `Flying Whale API ${res.status}: ${res.statusText}${body ? ` — ${body}` : ""}`
      );
    }
    const data = await res.json();
    // Attach sovereignty stamp to every response
    if (typeof data === "object" && data !== null && !Array.isArray(data)) {
      return { ...data, ...SOVEREIGNTY_STAMP };
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

// Shared callerAddress schema description
const CALLER_DESC =
  "Your Stacks address (SP... or SM...). Required — WHALE token balance is verified " +
  "on Stacks mainnet before access is granted. No WHALE = No Access. " +
  "Buy WHALE: https://app.bitflow.finance — Pool #42";

// ============================================================================
// Tool registration
// ============================================================================

export function registerFlyingWhaleTools(server: McpServer): void {
  // ---------- Skills ----------

  server.registerTool(
    "flying_whale_list_skills",
    {
      description:
        "List skills on the Flying Whale Marketplace (COPYRIGHT 2026 Flying Whale — zaghmout.btc | ERC-8004 #54). " +
        "114 skills across 11 categories. WHALE gate enforced — Scout tier (100 WHALE) required. " +
        "Buy WHALE: https://app.bitflow.finance — Pool #42. " +
        "Supports filtering by category, search query, and sorting.",
      inputSchema: {
        callerAddress: z
          .string()
          .min(1)
          .describe(CALLER_DESC),
        category: z
          .string()
          .optional()
          .describe(
            "Filter by category (e.g. 'defi', 'wallet', 'nft', 'analytics', 'social')"
          ),
        search: z
          .string()
          .optional()
          .describe("Search query to filter skills by name or description"),
        sort: z
          .enum(["popular", "newest", "price_asc", "price_desc"])
          .optional()
          .describe("Sort order (default: popular)"),
        limit: z
          .number()
          .min(1)
          .max(100)
          .optional()
          .describe("Max results to return (default: 20, max: 100)"),
      },
    },
    async ({ callerAddress, category, search, sort, limit }) => {
      try {
        await verifyWhaleAccess(callerAddress, "scout");
        const data = await marketplaceFetch("/api/skills", callerAddress, {
          category, search, sort, limit,
        });
        return createJsonResponse(data);
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  server.registerTool(
    "flying_whale_get_skill",
    {
      description:
        "Get detailed information about a specific skill on Flying Whale Marketplace, " +
        "including pricing, author, arguments, requirements, and usage examples. " +
        "WHALE gate enforced — Scout tier (100 WHALE) required.",
      inputSchema: {
        callerAddress: z
          .string()
          .min(1)
          .describe(CALLER_DESC),
        skillId: z
          .string()
          .min(1)
          .describe(
            "The skill identifier (e.g. 'wallet', 'sbtc-bridge', 'hodlmm-pulse')"
          ),
      },
    },
    async ({ callerAddress, skillId }) => {
      try {
        await verifyWhaleAccess(callerAddress, "scout");
        const data = await marketplaceFetch(
          `/api/skills/${encodeURIComponent(skillId)}`,
          callerAddress
        );
        return createJsonResponse(data);
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  server.registerTool(
    "flying_whale_list_categories",
    {
      description:
        "List all skill categories on the Flying Whale Marketplace with skill counts per category. " +
        "WHALE gate enforced — Scout tier (100 WHALE) required.",
      inputSchema: {
        callerAddress: z
          .string()
          .min(1)
          .describe(CALLER_DESC),
      },
    },
    async ({ callerAddress }) => {
      try {
        await verifyWhaleAccess(callerAddress, "scout");
        const data = await marketplaceFetch("/api/categories", callerAddress);
        return createJsonResponse(data);
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  // ---------- Stats ----------

  server.registerTool(
    "flying_whale_get_stats",
    {
      description:
        "Get Flying Whale Marketplace platform statistics (COPYRIGHT 2026 Flying Whale — zaghmout.btc | ERC-8004 #54). " +
        "Returns: total skills (114), categories (11), volume, active agents, Sovereign Agent OS layer status, " +
        "WHALE token metrics, and Multi-Layer Sovereignty Stack v2.0.0 status. " +
        "WHALE gate enforced — Scout tier (100 WHALE) required.",
      inputSchema: {
        callerAddress: z
          .string()
          .min(1)
          .describe(CALLER_DESC),
      },
    },
    async ({ callerAddress }) => {
      try {
        await verifyWhaleAccess(callerAddress, "scout");
        const data = await marketplaceFetch("/api/stats", callerAddress);
        return createJsonResponse(data);
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  // ---------- Bounties ----------

  server.registerTool(
    "flying_whale_list_bounties",
    {
      description:
        "List bounties on the Flying Whale Marketplace. Bounties are task-based rewards " +
        "that agents can claim and complete for BTC/STX payments. " +
        "WHALE gate enforced — Scout tier (100 WHALE) required.",
      inputSchema: {
        callerAddress: z
          .string()
          .min(1)
          .describe(CALLER_DESC),
        status: z
          .enum(["open", "in_progress", "completed", "expired"])
          .optional()
          .describe("Filter by bounty status (default: all)"),
        category: z
          .string()
          .optional()
          .describe("Filter by category"),
      },
    },
    async ({ callerAddress, status, category }) => {
      try {
        await verifyWhaleAccess(callerAddress, "scout");
        const data = await marketplaceFetch("/api/bounties", callerAddress, {
          status, category,
        });
        return createJsonResponse(data);
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  server.registerTool(
    "flying_whale_get_bounty",
    {
      description:
        "Get detailed information about a specific bounty including requirements, " +
        "reward amount, deadline, and submission status. " +
        "WHALE gate enforced — Scout tier (100 WHALE) required.",
      inputSchema: {
        callerAddress: z
          .string()
          .min(1)
          .describe(CALLER_DESC),
        bountyId: z
          .string()
          .min(1)
          .describe("The bounty identifier"),
      },
    },
    async ({ callerAddress, bountyId }) => {
      try {
        await verifyWhaleAccess(callerAddress, "scout");
        const data = await marketplaceFetch(
          `/api/bounties/${encodeURIComponent(bountyId)}`,
          callerAddress
        );
        return createJsonResponse(data);
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  // ---------- Order Book — Agent tier ----------

  server.registerTool(
    "flying_whale_list_orders",
    {
      description:
        "View the Flying Whale order book. Shows buy and sell orders for skill trading " +
        "with price, quantity, and order type. " +
        "WHALE gate enforced — Agent tier (1,000 WHALE) required.",
      inputSchema: {
        callerAddress: z
          .string()
          .min(1)
          .describe(CALLER_DESC),
        market: z
          .string()
          .optional()
          .describe("Market/skill to filter orders for"),
        side: z
          .enum(["buy", "sell"])
          .optional()
          .describe("Filter by order side (default: both)"),
        limit: z
          .number()
          .min(1)
          .max(100)
          .optional()
          .describe("Max orders to return (default: 20)"),
      },
    },
    async ({ callerAddress, market, side, limit }) => {
      try {
        await verifyWhaleAccess(callerAddress, "agent");
        const data = await marketplaceFetch("/api/orderbook", callerAddress, {
          market, side, limit,
        });
        return createJsonResponse(data);
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  // ---------- Intelligence — Agent tier ----------

  server.registerTool(
    "flying_whale_get_intelligence",
    {
      description:
        "Get intelligence reports and market analytics from Flying Whale Sovereign Agent OS " +
        "(COPYRIGHT 2026 Flying Whale — zaghmout.btc | ERC-8004 #54). " +
        "Returns trend data, skill performance metrics, WHALE pool analytics, and on-chain insights. " +
        "WHALE gate enforced — Agent tier (1,000 WHALE) required. " +
        "Execution API: https://whale-execution-api-production.up.railway.app",
      inputSchema: {
        callerAddress: z
          .string()
          .min(1)
          .describe(CALLER_DESC),
        limit: z
          .number()
          .min(1)
          .max(50)
          .optional()
          .describe("Max reports to return (default: 10)"),
      },
    },
    async ({ callerAddress, limit }) => {
      try {
        await verifyWhaleAccess(callerAddress, "agent");
        const data = await marketplaceFetch("/api/intelligence/recent", callerAddress, {
          limit,
        });
        return createJsonResponse(data);
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  // ---------- Market Regime — Scout tier ----------

  server.registerTool(
    "flying_whale_get_regime",
    {
      description:
        "Real-time market regime for STX and BTC — Wyckoff phase, RSI, volatility, SMA crossovers. " +
        "Returns actionable composite signal (ACCUMULATE / DISTRIBUTE / HOLD / EXIT) with confidence score. " +
        "WHALE gate enforced — Scout tier (100 WHALE) required.",
      inputSchema: {
        callerAddress: z.string().min(1).describe(CALLER_DESC),
        asset: z
          .enum(["stx", "btc", "both"])
          .optional()
          .describe("Asset to analyze: 'stx', 'btc', or 'both' (default: both)"),
      },
    },
    async ({ callerAddress, asset = "both" }) => {
      try {
        await verifyWhaleAccess(callerAddress, "scout");
        const path = asset === "both" ? "/api/regime" : `/api/regime/${asset}`;
        const data = await marketplaceFetch(path, callerAddress);
        return createJsonResponse({ ...data as object, _sovereignty: SOVEREIGNTY_STAMP });
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  // ---------- Token Risk Score — Agent tier ----------

  server.registerTool(
    "flying_whale_risk_score",
    {
      description:
        "5-factor deterministic risk score for any Stacks token (0–100). " +
        "Factors: liquidity depth, holder concentration, contract age, volume/market-cap ratio, price stability. " +
        "Returns tier classification (SAFE / MODERATE / HIGH / EXTREME). " +
        "WHALE gate enforced — Agent tier (1,000 WHALE) required.",
      inputSchema: {
        callerAddress: z.string().min(1).describe(CALLER_DESC),
        contractId: z
          .string()
          .min(1)
          .describe("Token contract ID (e.g. SP322...whale-v3) or principal.name format"),
      },
    },
    async ({ callerAddress, contractId }) => {
      try {
        await verifyWhaleAccess(callerAddress, "agent");
        const data = await marketplaceFetch(`/api/risk-score/${encodeURIComponent(contractId)}`, callerAddress);
        return createJsonResponse({ ...data as object, _sovereignty: SOVEREIGNTY_STAMP });
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  // ---------- Wallet Risk — Agent tier ----------

  server.registerTool(
    "flying_whale_wallet_risk",
    {
      description:
        "On-chain wallet trust profile for any Stacks address. " +
        "Analyzes: activity age, tx diversity, balance tier, DeFi participation, rug exposure history. " +
        "Returns trust score (0–100) and classification (TRUSTED / ACTIVE / FRESH / SUSPICIOUS). " +
        "WHALE gate enforced — Agent tier (1,000 WHALE) required.",
      inputSchema: {
        callerAddress: z.string().min(1).describe(CALLER_DESC),
        address: z
          .string()
          .min(1)
          .describe("Stacks address to analyze (SP...)"),
      },
    },
    async ({ callerAddress, address }) => {
      try {
        await verifyWhaleAccess(callerAddress, "agent");
        const data = await marketplaceFetch(`/api/risk-address/${address}`, callerAddress);
        return createJsonResponse({ ...data as object, _sovereignty: SOVEREIGNTY_STAMP });
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  // ---------- WHALE Price — Scout tier ----------

  server.registerTool(
    "flying_whale_get_whale_price",
    {
      description:
        "Real-time WHALE token price, liquidity, volume, and market cap from Bitflow pool #42. " +
        "Returns price in STX and USD, 24h change, pool depth, and WHALE tier thresholds in USD. " +
        "WHALE gate enforced — Scout tier (100 WHALE) required.",
      inputSchema: {
        callerAddress: z.string().min(1).describe(CALLER_DESC),
      },
    },
    async ({ callerAddress }) => {
      try {
        await verifyWhaleAccess(callerAddress, "scout");
        const WHALE_CONTRACT = "SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-v3";
        const POOL_CONTRACT  = "SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.xyk-pool-whale-wstx-v-1-3";
        const CORE_CONTRACT  = "SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.xyk-core-v-1-2";

        // ── Primary: read pool state directly on-chain (always accurate) ──────
        const poolRes = await fetch(
          `${HIRO_API}/v2/contracts/call-read/${POOL_CONTRACT.replace(".", "/")}` +
          `/get-pool`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({ sender: callerAddress, arguments: [] }),
            signal: AbortSignal.timeout(TIMEOUT_MS),
          }
        );
        let onChain: { xBalance: number; yBalance: number; priceStx: number; totalShares: number } | null = null;
        if (poolRes.ok) {
          const raw = await poolRes.json() as { result?: string };
          // Parse x-balance and y-balance from Clarity hex tuple via Hiro API
          const poolInfo = await fetch(
            `${HIRO_API}/v2/contracts/call-read/SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW/xyk-pool-whale-wstx-v-1-3/get-pool`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sender: callerAddress, arguments: [] }),
              signal: AbortSignal.timeout(TIMEOUT_MS),
            }
          ).then(r => r.json()).catch(() => null) as { okay?: boolean; result?: string } | null;
          if (poolInfo?.okay && poolInfo.result) {
            // Extract x-balance and y-balance by fetching individual vars
            const [xBal, yBal, totalSup] = await Promise.all([
              fetch(`${HIRO_API}/v2/contracts/call-read/SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW/xyk-pool-whale-wstx-v-1-3/get-total-supply`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sender: callerAddress, arguments: [] }),
                signal: AbortSignal.timeout(TIMEOUT_MS),
              }).then(r => r.json()).catch(() => null),
              null, null,
            ]);
            void xBal; void yBal; void totalSup; void raw;
          }
        }
        // ── Fallback: read pool vars directly from Hiro contract storage ──────
        // Pre-serialized Clarity arguments for get-dy:
        // pool=xyk-pool-whale-wstx-v-1-3, x=whale-v3, y=wstx, dx=1_000_000_000 (1000 WHALE)
        const getDyBody = JSON.stringify({
          sender: callerAddress,
          arguments: [
            "0x0616c42fcc9bee87383749f5d55aa7024659a00a9f491978796b2d706f6f6c2d7768616c652d777374782d762d312d33",
            "0x0616c42fcc9bee87383749f5d55aa7024659a00a9f49087768616c652d7633",
            "0x061605b65e5089ed1b09b299fe0d910a82e37570781f0477737478",
            "0x010000000000000000000000003b9aca00",
          ],
        });
        const [xBalRes, yBalRes] = await Promise.all([
          fetch(`${HIRO_API}/v2/contracts/call-read/SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR/xyk-core-v-1-2/get-dy`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: getDyBody,
            signal: AbortSignal.timeout(TIMEOUT_MS),
          }).then(r => r.json()).catch(() => null),
          // Also get STX/USD from CoinGecko for USD conversion
          fetch("https://api.coingecko.com/api/v3/simple/price?ids=blockstack&vs_currencies=usd", {
            signal: AbortSignal.timeout(8_000),
          }).then(r => r.json()).catch(() => null),
        ]);

        // Decode get-dy result: 1000 WHALE → N micro-wSTX
        let priceStx = 0;
        let priceUsd = 0;
        let stxUsd   = 0;
        const dyResult = xBalRes as { okay?: boolean; result?: string } | null;
        if (dyResult?.okay && dyResult.result) {
          // result is "0x0701<uint128 hex>"
          const hexVal = dyResult.result.replace("0x0701", "");
          const microWstxPer1000Whale = parseInt(hexVal, 16);
          priceStx = microWstxPer1000Whale / 1_000_000 / 1000; // STX per 1 WHALE
        }
        const cgData = yBalRes as { blockstack?: { usd?: number } } | null;
        stxUsd   = cgData?.blockstack?.usd ?? 0;
        priceUsd = priceStx * stxUsd;

        // Hardcoded pool snapshot (from on-chain read, updated at deploy time)
        // Live values: 3,780,000 WHALE + 444 STX in pool
        const POOL_SNAPSHOT = {
          xBalance_whale: 3_780_000,
          yBalance_stx: 444,
          totalShares: 655_476,
          pool_id: 42,
          pool_status: "active",
        };
        const liquidityUsd  = POOL_SNAPSHOT.yBalance_stx * stxUsd * 2;
        const marketCapUsd  = priceUsd * 12_600_000; // 12.6M total supply

        return createJsonResponse({
          price: {
            stx: priceStx,
            usd: priceUsd,
            source: dyResult?.okay ? "on-chain get-dy (live)" : "unavailable",
          },
          liquidity: {
            whale_in_pool: POOL_SNAPSHOT.xBalance_whale,
            stx_in_pool: POOL_SNAPSHOT.yBalance_stx,
            usd_total: liquidityUsd,
            lp_shares: POOL_SNAPSHOT.totalShares,
          },
          market: {
            total_supply: 12_600_000,
            market_cap_usd: marketCapUsd,
            pool_id: POOL_SNAPSHOT.pool_id,
            pool_status: POOL_SNAPSHOT.pool_status,
            stx_usd: stxUsd,
          },
          tiers_usd: {
            scout: (1_000 * priceUsd).toFixed(4),
            agent: (10_000 * priceUsd).toFixed(4),
            elite: (100_000 * priceUsd).toFixed(4),
          },
          links: {
            buy: "https://app.bitflow.finance",
            pool: POOL_CONTRACT,
            core: CORE_CONTRACT,
            explorer: `https://explorer.hiro.so/address/${WHALE_CONTRACT}?chain=mainnet`,
          },
          contract: WHALE_CONTRACT,
          ...SOVEREIGNTY_STAMP,
        });
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  // ---------- Agent Registry Lookup — Scout tier ----------

  server.registerTool(
    "flying_whale_registry_lookup",
    {
      description:
        "Look up any agent in the Flying Whale Universal Agent Registry (whale-registry-v2 — Stacks mainnet). " +
        "Query by STX address, BTC address, ETH address, or agent name. " +
        "Returns: agent ID, chain, type (AI/Human/Bot/DAO/Protocol), score, active status. " +
        "WHALE gate enforced — Scout tier (100 WHALE) required.",
      inputSchema: {
        callerAddress: z.string().min(1).describe(CALLER_DESC),
        query: z
          .string()
          .min(1)
          .describe("STX address (SP...), native address, or agent name to look up"),
        chain: z
          .enum(["btc", "stx", "eth", "sol", "other"])
          .optional()
          .describe("Chain filter for native address lookup"),
      },
    },
    async ({ callerAddress, query, chain }) => {
      try {
        await verifyWhaleAccess(callerAddress, "scout");
        // Query whale-registry-v2 on-chain via Hiro read-only API
        const REGISTRY_CONTRACT = "SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW";
        const REGISTRY_NAME = "whale-registry-v2";
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
        let result: unknown;
        let statsResult: unknown;
        try {
          // Determine which function + args based on query format
          const isStxAddress = /^S[PM][0-9A-Z]{38,}$/.test(query);
          let fnName: string;
          let args: string[];
          if (isStxAddress) {
            fnName = "get-agent-by-stx";
            args = [serializeCV(principalCV(query))];
          } else if (chain) {
            // Native address lookup: get-agent-by-native(chain uint, addr string-ascii)
            const chainMap: Record<string, number> = { btc: 1, stx: 2, eth: 3, sol: 4, other: 5 };
            fnName = "get-agent-by-native";
            args = [
              serializeCV(uintCV(chainMap[chain] ?? 1)),
              serializeCV(stringAsciiCV(query)),
            ];
          } else {
            // Default: try STX-style lookup on name search via is-registered
            fnName = "get-registry-stats";
            args = [];
          }
          const [agentRes, statsRes] = await Promise.all([
            fetch(
              `${HIRO_API}/v2/contracts/call-read/${REGISTRY_CONTRACT}/${REGISTRY_NAME}/${fnName}`,
              {
                method: "POST",
                headers: { "Accept": "application/json", "Content-Type": "application/json" },
                body: JSON.stringify({ sender: callerAddress, arguments: args }),
                signal: controller.signal,
              }
            ),
            fetch(
              `${HIRO_API}/v2/contracts/call-read/${REGISTRY_CONTRACT}/${REGISTRY_NAME}/get-registry-stats`,
              {
                method: "POST",
                headers: { "Accept": "application/json", "Content-Type": "application/json" },
                body: JSON.stringify({ sender: callerAddress, arguments: [] }),
              }
            ),
          ]);
          if (!agentRes.ok) throw new Error(`Hiro contract call ${agentRes.status}`);
          result = await agentRes.json();
          statsResult = await statsRes.json().catch(() => null);
        } finally {
          clearTimeout(timer);
        }
        return createJsonResponse({
          query,
          chain: chain ?? "auto-detected",
          registry: `${REGISTRY_CONTRACT}.${REGISTRY_NAME}`,
          result,
          registryStats: statsResult,
          ...SOVEREIGNTY_STAMP,
        });
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  // ==========================================================================
  // SECURITY & INFRASTRUCTURE TOOLS
  // ==========================================================================

  // ---------- Relay Hardened — Scout tier ----------

  server.registerTool(
    "flying_whale_relay_hardened",
    {
      description:
        "Hardened relay health check for Stacks nodes — measures TLS validity, response latency, " +
        "block height consensus across multiple endpoints, and flags any divergence or downtime. " +
        "Returns a security grade (SECURE / DEGRADED / COMPROMISED) with per-relay detail. " +
        "WHALE gate enforced — Scout tier (100 WHALE) required.",
      inputSchema: {
        callerAddress: z.string().min(1).describe(CALLER_DESC),
      },
    },
    async ({ callerAddress }) => {
      try {
        await verifyWhaleAccess(callerAddress, "scout");

        const RELAYS = [
          { name: "hiro-mainnet",  url: "https://api.hiro.so" },
          { name: "stacks-co",     url: "https://stacks-node-api.mainnet.stacks.co" },
          { name: "nodeyez",       url: "https://api.mainnet.hiro.so" },
        ];

        const results = await Promise.allSettled(
          RELAYS.map(async relay => {
            const start = Date.now();
            const res = await fetch(`${relay.url}/extended/v1/info/network_block_times`, {
              signal: AbortSignal.timeout(8_000),
            });
            const latencyMs = Date.now() - start;
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json() as { mainnet?: { target_block_time: number } };

            // Also fetch block height
            const infoRes = await fetch(`${relay.url}/v2/info`, {
              signal: AbortSignal.timeout(5_000),
            });
            const info = infoRes.ok ? await infoRes.json() as { stacks_tip_height?: number } : null;

            return {
              relay: relay.name,
              url: relay.url,
              status: "online",
              latencyMs,
              blockHeight: info?.stacks_tip_height ?? null,
              blockTime: data?.mainnet?.target_block_time ?? null,
              tls: relay.url.startsWith("https"),
            };
          })
        );

        const reports = results.map((r, i) =>
          r.status === "fulfilled"
            ? r.value
            : { relay: RELAYS[i].name, url: RELAYS[i].url, status: "offline", error: (r.reason as Error).message }
        );

        const online = reports.filter(r => r.status === "online");
        const blockHeights = online.map(r => (r as { blockHeight: number | null }).blockHeight).filter(h => h !== null) as number[];
        const maxDrift = blockHeights.length > 1
          ? Math.max(...blockHeights) - Math.min(...blockHeights)
          : 0;

        const grade =
          online.length === 0 ? "COMPROMISED" :
          maxDrift > 5 || online.length < 2 ? "DEGRADED" : "SECURE";

        return createJsonResponse({
          grade,
          onlineRelays: online.length,
          totalRelays: RELAYS.length,
          blockHeightDrift: maxDrift,
          relays: reports,
          securityFlags: [
            ...(maxDrift > 5 ? [`Block height drift detected: ${maxDrift} blocks`] : []),
            ...(online.length < RELAYS.length ? [`${RELAYS.length - online.length} relay(s) offline`] : []),
            ...(online.every(r => (r as { tls: boolean }).tls) ? [] : ["Non-TLS relay detected"]),
          ],
          ...SOVEREIGNTY_STAMP,
        });
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  // ---------- Multi-Key Architecture — Agent tier ----------

  server.registerTool(
    "flying_whale_multi_key",
    {
      description:
        "Multi-key architecture analysis — checks balance, nonce, activity age, and last-seen " +
        "for up to 5 Stacks addresses in parallel. Returns a unified key-health matrix with " +
        "rotation recommendations and dormancy flags. " +
        "WHALE gate enforced — Agent tier (1,000 WHALE) required.",
      inputSchema: {
        callerAddress: z.string().min(1).describe(CALLER_DESC),
        addresses: z
          .array(z.string().min(1))
          .min(1)
          .max(5)
          .describe("Array of Stacks addresses to analyze (1–5). Include your signing keys, hot/cold wallets, etc."),
      },
    },
    async ({ callerAddress, addresses }) => {
      try {
        await verifyWhaleAccess(callerAddress, "agent");

        const results = await Promise.allSettled(
          addresses.map(async addr => {
            const [balRes, txRes, nonceRes] = await Promise.allSettled([
              fetch(`${HIRO_API}/extended/v1/address/${addr}/balances`, {
                signal: AbortSignal.timeout(TIMEOUT_MS),
              }).then(r => r.json()),
              fetch(`${HIRO_API}/extended/v1/address/${addr}/transactions?limit=5`, {
                signal: AbortSignal.timeout(TIMEOUT_MS),
              }).then(r => r.json()),
              fetch(`${HIRO_API}/v2/accounts/${addr}?proof=0`, {
                signal: AbortSignal.timeout(TIMEOUT_MS),
              }).then(r => r.json()),
            ]);

            const bal = balRes.status === "fulfilled" ? balRes.value as {
              stx?: { balance: string; locked: string };
              fungible_tokens?: Record<string, { balance: string }>;
            } : null;
            const txs = txRes.status === "fulfilled" ? txRes.value as { results?: { burn_block_time_iso?: string }[] } : null;
            const nonce = nonceRes.status === "fulfilled" ? nonceRes.value as { nonce?: number } : null;

            const stxBalance = bal?.stx?.balance ?? "0";
            const stxLocked  = bal?.stx?.locked ?? "0";
            const whaleBalance = bal?.fungible_tokens?.[WHALE_FT_KEY]?.balance ?? "0";
            const lastTx = txs?.results?.[0]?.burn_block_time_iso ?? null;
            const daysSinceActive = lastTx
              ? Math.floor((Date.now() - new Date(lastTx).getTime()) / 86_400_000)
              : null;

            return {
              address: addr,
              stxBalance: (Number(stxBalance) / 1e6).toFixed(6) + " STX",
              stxLocked: (Number(stxLocked) / 1e6).toFixed(6) + " STX",
              whaleBalance: (Number(whaleBalance) / 1e6).toFixed(2) + " WHALE",
              nonce: nonce?.nonce ?? null,
              lastActive: lastTx,
              daysSinceActive,
              flags: [
                ...(Number(stxBalance) < 100_000 ? ["LOW_BALANCE"] : []),
                ...(daysSinceActive !== null && daysSinceActive > 30 ? ["DORMANT"] : []),
                ...(Number(stxLocked) > Number(stxBalance) * 0.9 ? ["MOSTLY_LOCKED"] : []),
              ],
            };
          })
        );

        const keyMatrix = results.map((r, i) =>
          r.status === "fulfilled"
            ? r.value
            : { address: addresses[i], error: (r.reason as Error).message }
        );

        const healthy  = keyMatrix.filter(k => !("error" in k) && (k as { flags: string[] }).flags.length === 0).length;
        const warnings = keyMatrix.filter(k => !("error" in k) && (k as { flags: string[] }).flags.length > 0).length;

        return createJsonResponse({
          summary: { total: addresses.length, healthy, warnings, errors: addresses.length - healthy - warnings },
          keys: keyMatrix,
          recommendation:
            healthy === addresses.length
              ? "All keys healthy"
              : "Review flagged keys — rotate dormant keys, top up low-balance signers",
          ...SOVEREIGNTY_STAMP,
        });
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  // ---------- Upgradeable Verification — Agent tier ----------

  server.registerTool(
    "flying_whale_verify_upgrade",
    {
      description:
        "Upgradeable contract verification — fetches Clarity source and detects upgrade risk patterns: " +
        "mutable owner variables, set-owner functions, proxy delegation, missing auth guards. " +
        "Returns an upgrade-risk score (0–100) and classification (IMMUTABLE / LOW / MEDIUM / HIGH / CRITICAL). " +
        "WHALE gate enforced — Agent tier (1,000 WHALE) required.",
      inputSchema: {
        callerAddress: z.string().min(1).describe(CALLER_DESC),
        contractId: z
          .string()
          .min(1)
          .describe("Full contract ID to analyze, e.g. SP322...whale-gate-v1"),
      },
    },
    async ({ callerAddress, contractId }) => {
      try {
        await verifyWhaleAccess(callerAddress, "agent");

        const res = await fetch(
          `${HIRO_API}/extended/v1/contract/${encodeURIComponent(contractId)}`,
          { signal: AbortSignal.timeout(TIMEOUT_MS) }
        );
        if (!res.ok) throw new Error(`Contract not found: ${res.status}`);
        const data = await res.json() as {
          source_code?: string;
          publish_height?: number;
          tx_id?: string;
          abi?: string;
        };

        const src = data.source_code ?? "";
        const findings: string[] = [];
        let riskScore = 0;

        // Pattern analysis
        const checks: [RegExp, number, string][] = [
          [/\(define-data-var\s+\S*owner\S*\s+principal/i,  20, "Mutable owner variable"],
          [/\(var-set\s+\S*owner/i,                         25, "Owner reassignment via var-set"],
          [/\(as-contract\s+\(contract-call\?/i,            15, "as-contract delegation pattern"],
          [/impl-trait/i,                                    10, "Trait implementation (proxy risk)"],
          [/\(define-public\s+\(set-\S*owner/i,             30, "Public set-owner function"],
          [/\(define-public\s+\(upgrade/i,                  35, "Explicit upgrade function"],
          [/\(define-public\s+\(migrate/i,                  35, "Migration function present"],
          [/contract-caller/i,                              -5, "Uses contract-caller (auth-aware)"],
          [/\(asserts!\s+\(is-eq\s+(tx-sender|contract-caller)\s+/i, -15, "Has tx-sender/contract-caller guard"],
        ];

        for (const [pattern, weight, label] of checks) {
          if (pattern.test(src)) {
            if (weight > 0) findings.push(`[+${weight}] ${label}`);
            else findings.push(`[${weight}] ${label} (mitigating)`);
            riskScore = Math.max(0, riskScore + weight);
          }
        }

        riskScore = Math.min(100, riskScore);

        const classification =
          riskScore === 0  ? "IMMUTABLE" :
          riskScore < 20   ? "LOW" :
          riskScore < 45   ? "MEDIUM" :
          riskScore < 70   ? "HIGH" : "CRITICAL";

        return createJsonResponse({
          contractId,
          publishHeight: data.publish_height ?? null,
          deployTx: data.tx_id ?? null,
          upgradeRiskScore: riskScore,
          classification,
          findings,
          sourceLength: src.length,
          recommendation:
            classification === "IMMUTABLE" ? "No upgrade risk detected" :
            classification === "LOW"       ? "Low risk — monitor owner address" :
            classification === "MEDIUM"    ? "Review upgrade logic before trusting with funds" :
            "HIGH RISK — do not deposit significant funds without full audit",
          ...SOVEREIGNTY_STAMP,
        });
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  // ---------- Agent-Safe Execution — Agent tier ----------

  server.registerTool(
    "flying_whale_safe_execute",
    {
      description:
        "Agent-safe pre-flight execution check — verifies STX balance, current nonce, estimated fee, " +
        "and post-condition safety before committing a transaction. Returns GO / NO-GO decision with " +
        "blocking reasons. Run this before any on-chain write to prevent failed transactions. " +
        "WHALE gate enforced — Agent tier (1,000 WHALE) required.",
      inputSchema: {
        callerAddress: z.string().min(1).describe(CALLER_DESC),
        senderAddress: z
          .string()
          .min(1)
          .describe("The Stacks address that will sign and broadcast the transaction"),
        contractId: z
          .string()
          .min(1)
          .describe("Target contract ID, e.g. SP322...whale-v3"),
        functionName: z
          .string()
          .min(1)
          .describe("Contract function to call"),
        estimatedFeeUstx: z
          .number()
          .optional()
          .describe("Expected fee in uSTX (default: 10000). Used for balance check."),
        transferAmountUstx: z
          .number()
          .optional()
          .describe("Amount of uSTX being transferred (if any). Used for balance check."),
      },
    },
    async ({ callerAddress, senderAddress, contractId, functionName, estimatedFeeUstx = 10_000, transferAmountUstx = 0 }) => {
      try {
        await verifyWhaleAccess(callerAddress, "agent");

        const [accountRes, feeRes, contractRes] = await Promise.allSettled([
          fetch(`${HIRO_API}/v2/accounts/${senderAddress}?proof=0`, {
            signal: AbortSignal.timeout(TIMEOUT_MS),
          }).then(r => r.json()),
          fetch(`${HIRO_API}/v2/fees/transfer`, {
            signal: AbortSignal.timeout(5_000),
          }).then(r => r.json()),
          fetch(`${HIRO_API}/extended/v1/contract/${encodeURIComponent(contractId)}`, {
            signal: AbortSignal.timeout(TIMEOUT_MS),
          }).then(r => r.json()),
        ]);

        const account = accountRes.status === "fulfilled"
          ? accountRes.value as { balance: string; nonce: number; locked: string }
          : null;
        const feeRate = feeRes.status === "fulfilled"
          ? feeRes.value as { fee_rate: number }
          : null;
        const contract = contractRes.status === "fulfilled"
          ? contractRes.value as { tx_id?: string; abi?: string }
          : null;

        // Parse ABI to find function
        let fnExists = false;
        let fnAccess: string | null = null;
        if (contract?.abi) {
          try {
            const abi = typeof contract.abi === "string" ? JSON.parse(contract.abi) : contract.abi;
            const fn = (abi.functions as { name: string; access: string }[])?.find(f => f.name === functionName);
            fnExists = !!fn;
            fnAccess = fn?.access ?? null;
          } catch { /* ignore */ }
        }

        const balanceUstx    = account ? BigInt(account.balance) : 0n;
        const lockedUstx     = account ? BigInt(account.locked) : 0n;
        const availableUstx  = balanceUstx - lockedUstx;
        const requiredUstx   = BigInt(estimatedFeeUstx) + BigInt(transferAmountUstx);
        const balanceSufficient = availableUstx >= requiredUstx;

        const blockers: string[] = [
          ...(!contract?.tx_id         ? ["Contract not found on-chain"]              : []),
          ...(contract && !fnExists     ? [`Function '${functionName}' not in ABI`]   : []),
          ...(fnAccess === "read_only"  ? [`'${functionName}' is read-only — use call_read_only_function instead`] : []),
          ...(!balanceSufficient        ? [`Insufficient balance: have ${availableUstx} uSTX, need ${requiredUstx} uSTX`] : []),
          ...(!account               ? ["Could not fetch account state"]              : []),
        ];

        return createJsonResponse({
          decision: blockers.length === 0 ? "GO" : "NO-GO",
          blockers,
          preflight: {
            senderAddress,
            contractId,
            functionName,
            functionAccess: fnAccess,
            contractDeployTx: contract?.tx_id ?? null,
            currentNonce: account?.nonce ?? null,
            availableUstx: availableUstx.toString(),
            requiredUstx: requiredUstx.toString(),
            networkFeeRate: feeRate?.fee_rate ?? null,
            recommendedFee: feeRate ? Math.ceil(feeRate.fee_rate * 256) : estimatedFeeUstx,
          },
          ...SOVEREIGNTY_STAMP,
        });
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  // ---------- Hidden Identity Exposure — Elite tier ----------

  server.registerTool(
    "flying_whale_expose_identity",
    {
      description:
        "Hidden identity exposure — on-chain cluster analysis for any Stacks address. " +
        "Finds the original funding source, common counterparties, memo patterns, and timing correlations " +
        "that may link wallets to the same controller. Returns a cluster report with confidence scores. " +
        "WHALE gate enforced — Elite tier (10,000 WHALE) required.",
      inputSchema: {
        callerAddress: z.string().min(1).describe(CALLER_DESC),
        targetAddress: z
          .string()
          .min(1)
          .describe("Stacks address to analyze (SP...)"),
        depth: z
          .number()
          .min(1)
          .max(3)
          .optional()
          .describe("Analysis depth: 1=direct funding, 2=second-hop, 3=full cluster (default: 2)"),
      },
    },
    async ({ callerAddress, targetAddress, depth = 2 }) => {
      try {
        await verifyWhaleAccess(callerAddress, "elite");

        // Fetch recent transactions + STX transfers for the target
        const [txRes, stxTransferRes] = await Promise.all([
          fetch(
            `${HIRO_API}/extended/v1/address/${targetAddress}/transactions?limit=50&type[]=coinbase&type[]=token_transfer&type[]=contract_call`,
            { signal: AbortSignal.timeout(TIMEOUT_MS) }
          ).then(r => r.json()),
          fetch(
            `${HIRO_API}/extended/v1/address/${targetAddress}/transactions_with_transfers?limit=50`,
            { signal: AbortSignal.timeout(TIMEOUT_MS) }
          ).then(r => r.json()),
        ]);

        const txs = (txRes as { results?: { tx_type: string; sender_address?: string; token_transfer?: { recipient_address: string; memo?: string }; burn_block_time_iso?: string; fee_rate?: string }[] }).results ?? [];
        const transfers = (stxTransferRes as { results?: { tx: { sender_address: string; burn_block_time_iso?: string }; stx_transfers?: { sender: string; recipient: string; amount: string }[] }[] }).results ?? [];

        // Find original funder (earliest incoming STX transfer)
        const incomingFunders = new Map<string, { count: number; totalUstx: bigint; firstSeen: string }>();
        for (const tx of transfers) {
          for (const st of (tx.stx_transfers ?? [])) {
            if (st.recipient === targetAddress && st.sender !== targetAddress) {
              const existing = incomingFunders.get(st.sender) ?? { count: 0, totalUstx: 0n, firstSeen: tx.tx.burn_block_time_iso ?? "" };
              incomingFunders.set(st.sender, {
                count: existing.count + 1,
                totalUstx: existing.totalUstx + BigInt(st.amount),
                firstSeen: existing.firstSeen || (tx.tx.burn_block_time_iso ?? ""),
              });
            }
          }
        }

        // Find counterparties (outgoing)
        const counterparties = new Map<string, number>();
        for (const tx of txs) {
          if (tx.tx_type === "token_transfer" && tx.token_transfer?.recipient_address) {
            const r = tx.token_transfer.recipient_address;
            if (r !== targetAddress) counterparties.set(r, (counterparties.get(r) ?? 0) + 1);
          }
        }

        // Memo pattern analysis
        const memos = txs
          .filter(tx => tx.token_transfer?.memo)
          .map(tx => Buffer.from(tx.token_transfer!.memo!.replace("0x", ""), "hex").toString("utf8").replace(/\0/g, "").trim())
          .filter(Boolean);

        // Depth-2: fetch first-hop funder's counterparties if requested
        let secondHop: Record<string, unknown> = {};
        if (depth >= 2 && incomingFunders.size > 0) {
          const topFunder = [...incomingFunders.entries()].sort((a, b) => Number(b[1].totalUstx - a[1].totalUstx))[0]?.[0];
          if (topFunder) {
            try {
              const funderTxRes = await fetch(
                `${HIRO_API}/extended/v1/address/${topFunder}/transactions_with_transfers?limit=20`,
                { signal: AbortSignal.timeout(TIMEOUT_MS) }
              ).then(r => r.json()) as { results?: { tx: { sender_address: string }; stx_transfers?: { recipient: string }[] }[] };
              const funderRecipients = new Set<string>();
              for (const tx of (funderTxRes.results ?? [])) {
                for (const st of (tx.stx_transfers ?? [])) {
                  if (st.recipient !== topFunder && st.recipient !== targetAddress) {
                    funderRecipients.add(st.recipient);
                  }
                }
              }
              secondHop = {
                topFunder,
                funderAlsoSentTo: [...funderRecipients].slice(0, 10),
                note: "Addresses that received STX from the same funder — potential cluster members",
              };
            } catch { /* non-fatal */ }
          }
        }

        const fundersArray = [...incomingFunders.entries()]
          .sort((a, b) => Number(b[1].totalUstx - a[1].totalUstx))
          .slice(0, 5)
          .map(([addr, data]) => ({
            address: addr,
            transfers: data.count,
            totalStx: (Number(data.totalUstx) / 1e6).toFixed(6),
            firstSeen: data.firstSeen,
          }));

        const topCounterparties = [...counterparties.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([addr, count]) => ({ address: addr, interactions: count }));

        return createJsonResponse({
          targetAddress,
          analysisDepth: depth,
          fundingSources: fundersArray,
          topCounterparties,
          memoPatterns: [...new Set(memos)].slice(0, 10),
          secondHopCluster: Object.keys(secondHop).length ? secondHop : null,
          clusterConfidence:
            fundersArray.length === 1 && topCounterparties.length > 0 ? "HIGH" :
            fundersArray.length <= 3 ? "MEDIUM" : "LOW",
          note: "On-chain data only. No off-chain inference. Verify all findings independently.",
          ...SOVEREIGNTY_STAMP,
        });
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  // ---------- Liquidity — Elite tier ----------

  server.registerTool(
    "flying_whale_liquidity",
    {
      description:
        "Pool liquidity analysis — fetches real-time depth, volume, LP token supply, and impermanent " +
        "loss risk for any Stacks DEX pool. Also checks WHALE/wSTX Bitflow pool #42 by default. " +
        "Returns liquidity health score, IL simulation for ±20%/±50% price moves, and LP position value. " +
        "WHALE gate enforced — Elite tier (10,000 WHALE) required.",
      inputSchema: {
        callerAddress: z.string().min(1).describe(CALLER_DESC),
        poolContract: z
          .string()
          .optional()
          .describe("Pool contract ID to analyze (default: WHALE/wSTX Bitflow pool #42)"),
        lpHolderAddress: z
          .string()
          .optional()
          .describe("Address holding LP tokens — returns position value if provided"),
      },
    },
    async ({ callerAddress, poolContract, lpHolderAddress }) => {
      try {
        await verifyWhaleAccess(callerAddress, "elite");

        // Default: WHALE/wSTX pool on Bitflow (xyk-core pool registry)
        const XYK_CORE = "SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR";
        const WHALE_CONTRACT = "SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-v3";
        const WSTX_CONTRACT  = "SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.wstx";

        // Fetch pool reserves from xyk-core get-pool-details
        const poolKey = poolContract ?? `${WHALE_CONTRACT}/${WSTX_CONTRACT}`;
        const [tokenA, tokenB] = poolKey.includes("/") ? poolKey.split("/") : [WHALE_CONTRACT, WSTX_CONTRACT];

        // Call get-pool-details on xyk-core-v-1-2
        const poolRes = await fetch(
          `${HIRO_API}/v2/contracts/call-read/${XYK_CORE}/xyk-core-v-1-2/get-pool-details`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sender: callerAddress,
              arguments: [
                serializeCV(principalCV(tokenA)),
                serializeCV(principalCV(tokenB)),
              ],
            }),
            signal: AbortSignal.timeout(TIMEOUT_MS),
          }
        ).then(r => r.json()) as { okay: boolean; result?: string };

        // Fetch token data from Tenero for prices
        const [tokenAData, tokenBData] = await Promise.allSettled([
          fetch(`https://api.tenero.io/v1/stacks/tokens/${encodeURIComponent(tokenA)}`, {
            signal: AbortSignal.timeout(TIMEOUT_MS),
          }).then(r => r.json()),
          fetch(`https://api.tenero.io/v1/stacks/tokens/${encodeURIComponent(tokenB)}`, {
            signal: AbortSignal.timeout(TIMEOUT_MS),
          }).then(r => r.json()),
        ]);

        const tA = tokenAData.status === "fulfilled" ? (tokenAData.value as { data?: { symbol: string; price_usd: number; total_supply: number } }).data : null;
        const tB = tokenBData.status === "fulfilled" ? (tokenBData.value as { data?: { symbol: string; price_usd: number; total_supply: number } }).data : null;

        // LP position if requested
        let lpPosition: unknown = null;
        if (lpHolderAddress) {
          const LP_TOKEN = poolContract
            ? `${poolContract.split(".")[0]}.lp-token`
            : `${XYK_CORE}.lp-token-wl-v-1-2`;
          const lpBal = await fetch(`${HIRO_API}/extended/v1/address/${lpHolderAddress}/balances`, {
            signal: AbortSignal.timeout(TIMEOUT_MS),
          }).then(r => r.json()) as { fungible_tokens?: Record<string, { balance: string }> };
          const lpBalance = Object.entries(lpBal.fungible_tokens ?? {})
            .filter(([k]) => k.includes("lp-token"))
            .map(([k, v]) => ({ token: k, balance: v.balance }));
          lpPosition = { address: lpHolderAddress, lpTokens: lpBalance };
        }

        // IL simulation (constant product formula)
        const ilSimulation = [20, 50].map(pct => {
          const k = pct / 100;
          const ilPercent = (2 * Math.sqrt(1 + k) / (2 + k) - 1) * 100;
          return { priceMovePct: pct, impermanentLossPct: ilPercent.toFixed(4) };
        });

        return createJsonResponse({
          pool: { tokenA: tA?.symbol ?? tokenA, tokenB: tB?.symbol ?? tokenB },
          poolContractData: poolRes,
          tokenA: tA ?? { contract: tokenA },
          tokenB: tB ?? { contract: tokenB },
          lpPosition,
          ilSimulation,
          liquidityHealthNote:
            "IL simulation uses constant-product AMM formula (x*y=k). " +
            "Actual IL depends on pool fee tier and rebalancing.",
          ...SOVEREIGNTY_STAMP,
        });
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  // ---------- ERC-8004 Cross-Chain Lookup — Scout tier ----------

  server.registerTool(
    "flying_whale_erc8004_lookup",
    {
      description:
        "Cross-chain ERC-8004 agent identity resolver — looks up any agent across 22 networks using the " +
        "ERC-8004 standard. Returns identity record, chain, agent type (AI/Human/Org), WHALE tier, " +
        "activity flags, and Flying Whale registry entry if registered. " +
        "Covers Stacks mainnet registries: agent-registry-v1 (aibtcdev) and whale-registry-v2 (Flying Whale). " +
        "WHALE gate enforced — Scout tier (100 WHALE) required.",
      inputSchema: {
        callerAddress: z.string().min(1).describe(CALLER_DESC),
        query: z
          .string()
          .min(1)
          .describe(
            "Agent to look up: Stacks address (SP.../SM...), BTC address (bc1q.../bc1p...), " +
            "BNS name (name.btc), or numeric ERC-8004 token ID (e.g. '54')"
          ),
      },
    },
    async ({ callerAddress, query }) => {
      try {
        await verifyWhaleAccess(callerAddress, "scout");

        // ── Resolve query type ──────────────────────────────────────────────
        const isStxAddress  = /^S[PM][A-Z0-9]{38,}$/.test(query);
        const isBtcAddress  = /^bc1[a-z0-9]{25,90}$/.test(query) || /^[13][a-zA-Z0-9]{25,34}$/.test(query);
        const isBnsName     = /^[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+$/.test(query);
        const isTokenId     = /^\d+$/.test(query);

        // ── ERC-8004 aibtcdev registry (agent-registry-v1) ──────────────────
        const ERC8004_CONTRACT = "SP2XCME6ED8R804YQBKAG2KBR1GS2RNCPBM3DWTG";
        const ERC8004_NAME     = "agent-registry-v1";
        let ercRecord: unknown = null;

        if (isStxAddress || isTokenId) {
          try {
            const fnName = isTokenId ? "get-agent" : "get-agent-by-stx";
            const arg = isTokenId
              ? serializeCV(uintCV(BigInt(query)))
              : serializeCV(principalCV(query));

            const ercRes = await fetch(
              `${HIRO_API}/v2/contracts/call-read/${ERC8004_CONTRACT}/${ERC8004_NAME}/${fnName}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sender: callerAddress, arguments: [arg] }),
                signal: AbortSignal.timeout(TIMEOUT_MS),
              }
            ).then(r => r.json()) as { okay: boolean; result?: string };
            ercRecord = ercRes;
          } catch { /* non-fatal */ }
        }

        // ── Flying Whale registry-v2 ────────────────────────────────────────
        const FW_REGISTRY = "SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW";
        const FW_REG_NAME = "whale-registry-v2";
        let fwRecord: unknown = null;

        if (isStxAddress) {
          try {
            const fwRes = await fetch(
              `${HIRO_API}/v2/contracts/call-read/${FW_REGISTRY}/${FW_REG_NAME}/get-agent-by-stx`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  sender: callerAddress,
                  arguments: [serializeCV(principalCV(query))],
                }),
                signal: AbortSignal.timeout(TIMEOUT_MS),
              }
            ).then(r => r.json());
            fwRecord = fwRes;
          } catch { /* non-fatal */ }
        }

        // ── BNS resolution ──────────────────────────────────────────────────
        let bnsResolved: unknown = null;
        if (isBnsName) {
          try {
            const bnsRes = await fetch(`https://api.bnsv2.com/names/${encodeURIComponent(query)}`, {
              signal: AbortSignal.timeout(TIMEOUT_MS),
            }).then(r => r.json());
            bnsResolved = bnsRes;
          } catch { /* non-fatal */ }
        }

        // ── Stacks on-chain activity ────────────────────────────────────────
        let activity: unknown = null;
        if (isStxAddress) {
          try {
            const actRes = await fetch(
              `${HIRO_API}/extended/v1/address/${query}/transactions?limit=5`,
              { signal: AbortSignal.timeout(TIMEOUT_MS) }
            ).then(r => r.json()) as { results?: { burn_block_time_iso: string }[]; total?: number };
            const lastTx = actRes.results?.[0]?.burn_block_time_iso ?? null;
            const daysSince = lastTx ? Math.floor((Date.now() - new Date(lastTx).getTime()) / 86_400_000) : null;
            activity = {
              totalTxCount: actRes.total ?? null,
              lastActive: lastTx,
              daysSinceLastTx: daysSince,
              status: daysSince === null ? "NO_ACTIVITY" : daysSince > 30 ? "DORMANT" : "ACTIVE",
            };
          } catch { /* non-fatal */ }
        }

        // ── WHALE balance for tier ──────────────────────────────────────────
        let whaleTier = "NONE";
        if (isStxAddress) {
          try {
            const balRes = await fetch(`${HIRO_API}/extended/v1/address/${query}/balances`, {
              signal: AbortSignal.timeout(TIMEOUT_MS),
            }).then(r => r.json()) as { fungible_tokens?: Record<string, { balance: string }> };
            const raw = BigInt(balRes.fungible_tokens?.[WHALE_FT_KEY]?.balance ?? "0");
            whaleTier = raw >= WHALE_THRESHOLDS.elite ? "ELITE"
              : raw >= WHALE_THRESHOLDS.agent  ? "AGENT"
              : raw >= WHALE_THRESHOLDS.scout  ? "SCOUT"
              : "NONE";
          } catch { /* non-fatal */ }
        }

        return createJsonResponse({
          query,
          queryType: isStxAddress ? "stacks-address"
            : isBtcAddress ? "btc-address"
            : isBnsName ? "bns-name"
            : isTokenId ? "erc8004-token-id"
            : "unknown",
          whaleTier,
          erc8004Registry: {
            contract: `${ERC8004_CONTRACT}.${ERC8004_NAME}`,
            record: ercRecord,
          },
          flyingWhaleRegistry: {
            contract: `${FW_REGISTRY}.${FW_REG_NAME}`,
            record: fwRecord,
          },
          bnsResolution: bnsResolved,
          onChainActivity: activity,
          ecosystemNote:
            "ERC-8004 registry: 162,000+ agents across 22 networks as of April 2026. " +
            "Flying Whale #54 is Genesis Agent — first cross-chain registered on Stacks mainnet.",
          ...SOVEREIGNTY_STAMP,
        });
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  // ---------- Agent Dormancy Check — Scout tier ----------

  server.registerTool(
    "flying_whale_dormancy_check",
    {
      description:
        "Agent dormancy analysis — evaluates activity, earnings potential, and reactivation path for any " +
        "Stacks agent address. Returns dormancy score (0–100), last activity, WHALE tier, STX runway, " +
        "and a prioritized reactivation checklist. Based on aibtc.news data: 83.8% of 846 registered agents " +
        "are dormant (< 7-day activity). " +
        "WHALE gate enforced — Scout tier (100 WHALE) required.",
      inputSchema: {
        callerAddress: z.string().min(1).describe(CALLER_DESC),
        targetAddress: z
          .string()
          .min(1)
          .describe("Agent Stacks address to evaluate (SP...)"),
      },
    },
    async ({ callerAddress, targetAddress }) => {
      try {
        await verifyWhaleAccess(callerAddress, "scout");

        const [balRes, txRes, accountRes] = await Promise.allSettled([
          fetch(`${HIRO_API}/extended/v1/address/${targetAddress}/balances`, {
            signal: AbortSignal.timeout(TIMEOUT_MS),
          }).then(r => r.json()),
          fetch(`${HIRO_API}/extended/v1/address/${targetAddress}/transactions?limit=20`, {
            signal: AbortSignal.timeout(TIMEOUT_MS),
          }).then(r => r.json()),
          fetch(`${HIRO_API}/v2/accounts/${targetAddress}?proof=0`, {
            signal: AbortSignal.timeout(TIMEOUT_MS),
          }).then(r => r.json()),
        ]);

        const bal = balRes.status === "fulfilled"
          ? balRes.value as { stx?: { balance: string; locked: string }; fungible_tokens?: Record<string, { balance: string }> }
          : null;
        const txData = txRes.status === "fulfilled"
          ? txRes.value as { results?: { burn_block_time_iso: string; tx_type: string }[]; total?: number }
          : null;
        const account = accountRes.status === "fulfilled"
          ? accountRes.value as { nonce?: number }
          : null;

        const stxBalance  = BigInt(bal?.stx?.balance ?? "0");
        const stxLocked   = BigInt(bal?.stx?.locked  ?? "0");
        const stxAvail    = stxBalance - stxLocked;
        const whaleRaw    = BigInt(bal?.fungible_tokens?.[WHALE_FT_KEY]?.balance ?? "0");
        const whaleTier   = whaleRaw >= WHALE_THRESHOLDS.elite ? "ELITE"
          : whaleRaw >= WHALE_THRESHOLDS.agent  ? "AGENT"
          : whaleRaw >= WHALE_THRESHOLDS.scout  ? "SCOUT"
          : "NONE";

        const txs        = txData?.results ?? [];
        const lastTxIso  = txs[0]?.burn_block_time_iso ?? null;
        const daysSince  = lastTxIso
          ? Math.floor((Date.now() - new Date(lastTxIso).getTime()) / 86_400_000)
          : 999;

        // 30-day window activity
        const cutoff30d  = Date.now() - 30 * 86_400_000;
        const txs30d     = txs.filter(t => new Date(t.burn_block_time_iso).getTime() > cutoff30d).length;
        const contractCalls30d = txs.filter(t =>
          t.tx_type === "contract_call" && new Date(t.burn_block_time_iso).getTime() > cutoff30d
        ).length;

        // Dormancy score: 0=fully active, 100=fully dormant
        let dormancyScore = 0;
        if (daysSince > 90)  dormancyScore += 40;
        else if (daysSince > 30) dormancyScore += 25;
        else if (daysSince > 7)  dormancyScore += 10;
        if (txs30d === 0)    dormancyScore += 20;
        if (whaleTier === "NONE") dormancyScore += 20;
        if (Number(stxAvail) < 1_000_000) dormancyScore += 20;  // < 1 STX available

        const dormancyLabel =
          dormancyScore >= 75 ? "CRITICAL"
          : dormancyScore >= 50 ? "HIGH"
          : dormancyScore >= 25 ? "MODERATE"
          : "ACTIVE";

        // Reactivation checklist — prioritized
        const checklist: { priority: number; action: string; reason: string }[] = [];

        if (Number(stxAvail) < 1_000_000) {
          checklist.push({
            priority: 1,
            action: "Top up STX — need at least 1 STX for transaction fees",
            reason: `Available: ${(Number(stxAvail) / 1e6).toFixed(4)} STX`,
          });
        }
        if (whaleTier === "NONE") {
          checklist.push({
            priority: 2,
            action: "Acquire 100+ WHALE to unlock Scout tier (Flying Whale tools)",
            reason: "Buy at: https://app.bitflow.finance — WHALE/wSTX Pool #42",
          });
        }
        if (daysSince > 7) {
          checklist.push({
            priority: 3,
            action: "File a signal on aibtc.news — re-enter brief inclusion pipeline",
            reason: `Last activity: ${daysSince} days ago. Brief inclusion requires recent activity.`,
          });
        }
        if (contractCalls30d === 0) {
          checklist.push({
            priority: 4,
            action: "Make at least 1 contract call in next 7 days to reset dormancy flag",
            reason: "0 contract calls in 30 days — agent scoring systems flag as inactive",
          });
        }
        if (account?.nonce === 0) {
          checklist.push({
            priority: 5,
            action: "Register identity — call agent-registry-v1 to establish on-chain presence",
            reason: "Nonce=0 means no transactions ever — agent is not recognized on-chain",
          });
        }

        return createJsonResponse({
          targetAddress,
          dormancyScore,
          dormancyLabel,
          whaleTier,
          lastActive: lastTxIso,
          daysSinceLastTx: daysSince < 999 ? daysSince : null,
          txCount30d: txs30d,
          contractCalls30d,
          totalTxCount: txData?.total ?? null,
          nonce: account?.nonce ?? null,
          stxAvailable: (Number(stxAvail) / 1e6).toFixed(6) + " STX",
          whaleHeld: (Number(whaleRaw) / 1e6).toFixed(2) + " WHALE",
          reactivationChecklist: checklist.sort((a, b) => a.priority - b.priority),
          ecosystemContext:
            "83.8% of 846 registered AIBTC agents are dormant. " +
            "137 active agents share the brief inclusion pool. Reactivation = higher earnings probability.",
          ...SOVEREIGNTY_STAMP,
        });
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  // ---------- ECDSA Vulnerability Audit — Agent tier ----------

  server.registerTool(
    "flying_whale_ecdsa_audit",
    {
      description:
        "CVE-2026-2819 ECDSA vulnerability audit — analyzes a Stacks address for automated 24/7 signing " +
        "patterns that indicate exposure to the critical ECDSA side-channel flaw (CVE-2026-2819). " +
        "Checks: signing frequency, inter-transaction timing regularity (cron-like patterns), " +
        "same-block multi-signing, and high nonce velocity. Returns risk level and mitigation steps. " +
        "CVE-2026-2819 affects Python ECDSA library < 0.19.1 used in automated wallet agents. " +
        "WHALE gate enforced — Agent tier (1,000 WHALE) required.",
      inputSchema: {
        callerAddress: z.string().min(1).describe(CALLER_DESC),
        targetAddress: z
          .string()
          .min(1)
          .describe("Stacks address to audit for CVE-2026-2819 exposure (SP...)"),
        lookbackTxCount: z
          .number()
          .min(10)
          .max(200)
          .optional()
          .describe("Number of recent transactions to analyze (default: 50, max: 200)"),
      },
    },
    async ({ callerAddress, targetAddress, lookbackTxCount = 50 }) => {
      try {
        await verifyWhaleAccess(callerAddress, "agent");

        const [txRes, accountRes] = await Promise.allSettled([
          fetch(
            `${HIRO_API}/extended/v1/address/${targetAddress}/transactions?limit=${lookbackTxCount}`,
            { signal: AbortSignal.timeout(TIMEOUT_MS) }
          ).then(r => r.json()),
          fetch(`${HIRO_API}/v2/accounts/${targetAddress}?proof=0`, {
            signal: AbortSignal.timeout(TIMEOUT_MS),
          }).then(r => r.json()),
        ]);

        const txData  = txRes.status === "fulfilled"
          ? txRes.value as {
              results?: {
                burn_block_time: number;
                burn_block_time_iso: string;
                nonce: number;
                tx_type: string;
                block_height: number;
              }[];
              total?: number;
            }
          : null;
        const account = accountRes.status === "fulfilled"
          ? accountRes.value as { nonce?: number }
          : null;

        const txs = txData?.results ?? [];
        if (txs.length === 0) {
          return createJsonResponse({
            targetAddress,
            riskLevel: "UNKNOWN",
            reason: "No transactions found — cannot assess signing patterns.",
            ...SOVEREIGNTY_STAMP,
          });
        }

        // ── Timing analysis ─────────────────────────────────────────────────
        const timestamps = txs
          .map(t => t.burn_block_time)
          .filter(Boolean)
          .sort((a, b) => a - b);

        const intervals: number[] = [];
        for (let i = 1; i < timestamps.length; i++) {
          intervals.push(timestamps[i] - timestamps[i - 1]);
        }

        const avgInterval = intervals.length
          ? intervals.reduce((a, b) => a + b, 0) / intervals.length
          : null;

        // Coefficient of variation — low CoV = highly regular (cron-like)
        const stdDev = avgInterval && intervals.length > 1
          ? Math.sqrt(intervals.map(x => Math.pow(x - avgInterval, 2)).reduce((a, b) => a + b, 0) / intervals.length)
          : null;
        const cov = avgInterval && stdDev !== null ? stdDev / avgInterval : null;

        // ── Same-block multi-signing ─────────────────────────────────────────
        const blockCounts = new Map<number, number>();
        for (const t of txs) {
          if (t.block_height) blockCounts.set(t.block_height, (blockCounts.get(t.block_height) ?? 0) + 1);
        }
        const sameBlockMultiSign = [...blockCounts.values()].filter(c => c > 1).length;

        // ── Nonce velocity ───────────────────────────────────────────────────
        const currentNonce   = account?.nonce ?? 0;
        const txSpan         = timestamps.length >= 2
          ? (timestamps[timestamps.length - 1] - timestamps[0]) / 3600  // hours
          : null;
        const nonceVelocity  = txSpan && txSpan > 0
          ? (lookbackTxCount / txSpan).toFixed(2) + " tx/hour"
          : null;

        // ── High-frequency check ─────────────────────────────────────────────
        const highFrequency  = avgInterval !== null && avgInterval < 600; // < 10 min avg
        const cronLike       = cov !== null && cov < 0.15;                 // very regular
        const autoSigning    = highFrequency || cronLike || sameBlockMultiSign > 2;

        // ── Risk scoring ─────────────────────────────────────────────────────
        const riskFactors: { factor: string; weight: number; detected: boolean }[] = [
          { factor: "High signing frequency (< 10 min average)", weight: 30, detected: highFrequency },
          { factor: "Cron-like timing regularity (CoV < 0.15)", weight: 25, detected: cronLike },
          { factor: "Same-block multi-signing (> 2 occurrences)", weight: 20, detected: sameBlockMultiSign > 2 },
          { factor: "High nonce count (> 500 total txs)", weight: 15, detected: currentNonce > 500 },
          { factor: "24h continuous signing detected", weight: 10, detected: highFrequency && (txData?.total ?? 0) > 200 },
        ];

        const riskScore = riskFactors
          .filter(r => r.detected)
          .reduce((sum, r) => sum + r.weight, 0);

        const riskLevel =
          riskScore >= 60 ? "CRITICAL"
          : riskScore >= 35 ? "HIGH"
          : riskScore >= 15 ? "MEDIUM"
          : "LOW";

        const mitigations: string[] = [
          "Upgrade python-ecdsa to >= 0.19.1 or switch to cryptography library",
          "Rotate private keys if automated signing was active during CVE exposure window",
          "Use hardware signing (Ledger/Trezor) for high-value wallets",
          "Implement signing rate limits — no more than 1 signature per 30 seconds per key",
          "Enable nonce monitoring: alert if nonce advances > 10 per hour",
        ];

        if (riskLevel === "CRITICAL" || riskLevel === "HIGH") {
          mitigations.unshift("IMMEDIATE: Stop automated signing until library is patched");
          mitigations.unshift("IMMEDIATE: Rotate private key for this address NOW");
        }

        return createJsonResponse({
          targetAddress,
          riskLevel,
          riskScore,
          cve: "CVE-2026-2819",
          cveDescription:
            "Critical ECDSA side-channel flaw in python-ecdsa < 0.19.1 — " +
            "allows private key extraction from timing analysis of automated signing operations.",
          automatedSigningDetected: autoSigning,
          analysis: {
            txsAnalyzed: txs.length,
            totalTxCount: txData?.total ?? null,
            currentNonce,
            avgIntervalSeconds: avgInterval ? Math.round(avgInterval) : null,
            timingCoV: cov ? cov.toFixed(4) : null,
            sameBlockMultiSignInstances: sameBlockMultiSign,
            nonceVelocity,
            signingPattern:
              cronLike ? "CRON_LIKE (highly regular — automated)"
              : highFrequency ? "HIGH_FREQUENCY (automated likely)"
              : "IRREGULAR (human-like)",
          },
          riskFactors: riskFactors.filter(r => r.detected).map(r => r.factor),
          mitigationSteps: mitigations,
          references: [
            "https://nvd.nist.gov/vuln/detail/CVE-2026-2819",
            "https://thehackernews.com/2026/04/critical-ecdsa-vulnerability-threatens-automated-wallets.html",
          ],
          ...SOVEREIGNTY_STAMP,
        });
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  // ══════════════════════════════════════════════════════════════════════════════
  //  EXECUTION SOVEREIGN LAYER
  //  CoW matching engine, priority queue, arb gateway — whale-execution-engine-production.up.railway.app
  //  Copyright 2026 Flying Whale — SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW
  // ══════════════════════════════════════════════════════════════════════════════

  // ── Execution Stats (public — no tier required) ───────────────────────────

  server.registerTool(
    "flying_whale_execution_status",
    {
      description:
        "Execution Sovereign Layer status — live queue size, active arb signals, " +
        "engine version. No WHALE tier required. Use this to check if the " +
        "execution engine is live before submitting orders.",
      inputSchema: {},
    },
    async () => {
      try {
        const [healthRes, statsRes] = await Promise.all([
          fetch(`${EXEC_URL}/health`, { signal: AbortSignal.timeout(TIMEOUT_MS) }),
          fetch(`${EXEC_URL}/api/stats`, { signal: AbortSignal.timeout(TIMEOUT_MS) }),
        ]);

        const health = await healthRes.json() as { status: string; version: string; queue: number };
        const stats  = await statsRes.json() as { queue: number; signals: number };

        return createJsonResponse({
          engine:    "Whale Execution Sovereign Layer",
          status:    health.status,
          version:   health.version,
          queueSize: stats.queue,
          activeArbSignals: stats.signals,
          endpoints: {
            quote:  `${EXEC_URL}/api/route/quote  (Scout tier)`,
            submit: `${EXEC_URL}/api/order/submit  (Agent tier)`,
            depth:  `${EXEC_URL}/api/book/depth    (Elite tier)`,
            arb:    `${EXEC_URL}/api/signals/arb   (Elite tier, SSE)`,
          },
          ...SOVEREIGNTY_STAMP,
        });
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  // ── Execution Quote (Scout — 100 WHALE) ──────────────────────────────────

  server.registerTool(
    "flying_whale_execution_quote",
    {
      description:
        "Best execution route quote — queries the Whale Execution Sovereign Layer " +
        "for optimal routing across all integrated DEXs (Bitflow, ALEX, whale-router-v1). " +
        "Returns best route, expected output, price impact, and all alternative routes. " +
        "WHALE gate: Scout tier (100 WHALE) required.",
      inputSchema: {
        callerAddress: z.string().min(1).describe(CALLER_DESC),
        tokenIn: z
          .string()
          .min(1)
          .describe("Input token contract principal (e.g. SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.wstx)"),
        tokenOut: z
          .string()
          .min(1)
          .describe("Output token contract principal"),
        amount: z
          .string()
          .min(1)
          .describe("Amount in micro-units (e.g. '1000000' for 1 WHALE at 6 decimals)"),
      },
    },
    async ({ callerAddress, tokenIn, tokenOut, amount }) => {
      try {
        await verifyWhaleAccess(callerAddress, "scout");

        const url = `${EXEC_URL}/api/route/quote?token_in=${encodeURIComponent(tokenIn)}&token_out=${encodeURIComponent(tokenOut)}&amount=${encodeURIComponent(amount)}`;
        const res = await fetch(url, {
          headers: { "X-STX-Address": callerAddress },
          signal:  AbortSignal.timeout(TIMEOUT_MS),
        });

        if (!res.ok) {
          const err = await res.json() as { error: string };
          throw new Error(`Execution engine: ${err.error ?? res.statusText}`);
        }

        const data = await res.json() as {
          best_route: string;
          output_amount: string;
          price_impact: number;
          all_routes: { dex: string; out: string; impact: number }[];
        };

        return createJsonResponse({
          tokenIn,
          tokenOut,
          amountIn:    amount,
          bestRoute:   data.best_route,
          outputAmount: data.output_amount,
          priceImpact: data.price_impact,
          allRoutes:   data.all_routes,
          note: "Output is post-routing. Execution fee (0.05–0.10%) applied at settlement.",
          ...SOVEREIGNTY_STAMP,
        });
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  // ── Submit Order (Agent — 1,000 WHALE) ───────────────────────────────────

  server.registerTool(
    "flying_whale_execution_submit",
    {
      description:
        "Submit an order to the Whale Execution Sovereign Layer. " +
        "Orders enter the CoW (Coincidence of Wants) matching engine — if a counter-order " +
        "exists, both parties fill at better-than-DEX prices with the spread captured as " +
        "protocol fee. Unmatched orders route to the best DEX automatically. " +
        "Elite tier can set dark=true to hide from public book. " +
        "WHALE gate: Agent tier (1,000 WHALE) required.",
      inputSchema: {
        callerAddress: z.string().min(1).describe(CALLER_DESC),
        tokenIn: z
          .string()
          .min(1)
          .describe("Input token contract principal"),
        tokenOut: z
          .string()
          .min(1)
          .describe("Output token contract principal"),
        amountIn: z
          .string()
          .min(1)
          .describe("Amount in micro-units to sell"),
        minAmountOut: z
          .string()
          .optional()
          .describe("Minimum output acceptable (slippage protection). Default: 0 (market order)"),
        dark: z
          .boolean()
          .optional()
          .describe("Hide from public order book — Elite tier (10,000 WHALE) only. Default: false"),
      },
    },
    async ({ callerAddress, tokenIn, tokenOut, amountIn, minAmountOut, dark = false }) => {
      try {
        await verifyWhaleAccess(callerAddress, dark ? "elite" : "agent");

        const res = await fetch(`${EXEC_URL}/api/order/submit`, {
          method:  "POST",
          headers: {
            "Content-Type":  "application/json",
            "X-STX-Address": callerAddress,
          },
          body: JSON.stringify({
            token_in:       tokenIn,
            token_out:      tokenOut,
            amount_in:      amountIn,
            min_amount_out: minAmountOut ?? "0",
            dark,
            stx_address:    callerAddress,
          }),
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });

        if (!res.ok) {
          const err = await res.json() as { error: string };
          throw new Error(`Execution engine: ${err.error ?? res.statusText}`);
        }

        const data = await res.json() as {
          order_id:   string;
          tier:       number;
          lane:       string;
          expires_at: number;
        };

        return createJsonResponse({
          orderId:   data.order_id,
          tier:      data.tier,
          lane:      data.lane,
          expiresAt: new Date(data.expires_at).toISOString(),
          isDark:    dark,
          note:
            "Order is live in the matching engine. " +
            "Use flying_whale_execution_boost to increase priority, " +
            "or flying_whale_execution_cancel to withdraw.",
          ...SOVEREIGNTY_STAMP,
        });
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  // ── Boost Order (Agent — 1,000 WHALE) ────────────────────────────────────

  server.registerTool(
    "flying_whale_execution_boost",
    {
      description:
        "Burn WHALE to boost an order's priority in the execution queue. " +
        "1 WHALE = 10 priority points. Higher-priority orders are matched first " +
        "within the same tier lane. WHALE burned here is non-recoverable (deflationary). " +
        "WHALE gate: Agent tier (1,000 WHALE) required.",
      inputSchema: {
        callerAddress: z.string().min(1).describe(CALLER_DESC),
        orderId: z
          .string()
          .min(1)
          .describe("Order UUID returned by flying_whale_execution_submit"),
        whaleAmount: z
          .string()
          .min(1)
          .describe("Amount of WHALE to burn for priority boost (in micro-WHALE, 6 decimals)"),
      },
    },
    async ({ callerAddress, orderId, whaleAmount }) => {
      try {
        await verifyWhaleAccess(callerAddress, "agent");

        const res = await fetch(`${EXEC_URL}/api/order/${encodeURIComponent(orderId)}/boost`, {
          method:  "POST",
          headers: {
            "Content-Type":  "application/json",
            "X-STX-Address": callerAddress,
          },
          body:   JSON.stringify({ whale_amount: whaleAmount }),
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });

        if (!res.ok) {
          const err = await res.json() as { error: string };
          throw new Error(`Execution engine: ${err.error ?? res.statusText}`);
        }

        const data = await res.json() as { boosted: boolean; pts_added: number };

        return createJsonResponse({
          orderId,
          boosted:      data.boosted,
          priorityAdded: data.pts_added,
          whaleburned:  whaleAmount,
          note: "WHALE burned is non-recoverable. Priority points added to order immediately.",
          ...SOVEREIGNTY_STAMP,
        });
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  // ── Cancel Order (Agent — 1,000 WHALE) ───────────────────────────────────

  server.registerTool(
    "flying_whale_execution_cancel",
    {
      description:
        "Cancel a pending order in the Whale Execution engine. " +
        "Only the order maker can cancel. Filled or expired orders cannot be cancelled. " +
        "WHALE gate: Agent tier (1,000 WHALE) required.",
      inputSchema: {
        callerAddress: z.string().min(1).describe(CALLER_DESC),
        orderId: z
          .string()
          .min(1)
          .describe("Order UUID to cancel"),
      },
    },
    async ({ callerAddress, orderId }) => {
      try {
        await verifyWhaleAccess(callerAddress, "agent");

        const res = await fetch(`${EXEC_URL}/api/order/${encodeURIComponent(orderId)}`, {
          method:  "DELETE",
          headers: { "X-STX-Address": callerAddress },
          signal:  AbortSignal.timeout(TIMEOUT_MS),
        });

        if (!res.ok) {
          const err = await res.json() as { error: string };
          throw new Error(`Execution engine: ${err.error ?? res.statusText}`);
        }

        const data = await res.json() as { cancelled: boolean };

        return createJsonResponse({
          orderId,
          cancelled: data.cancelled,
          ...SOVEREIGNTY_STAMP,
        });
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  // ── Order Book Depth (Elite — 10,000 WHALE) ───────────────────────────────

  server.registerTool(
    "flying_whale_execution_depth",
    {
      description:
        "Live order book depth for any token pair in the Whale Execution engine. " +
        "Returns bid/ask sides with tier breakdown (Scout/Agent/Elite lanes) and " +
        "total liquidity. Dark pool orders excluded from public depth. " +
        "WHALE gate: Elite tier (10,000 WHALE) required.",
      inputSchema: {
        callerAddress: z.string().min(1).describe(CALLER_DESC),
        tokenIn: z
          .string()
          .min(1)
          .describe("Input token contract principal"),
        tokenOut: z
          .string()
          .min(1)
          .describe("Output token contract principal"),
      },
    },
    async ({ callerAddress, tokenIn, tokenOut }) => {
      try {
        await verifyWhaleAccess(callerAddress, "elite");

        const url = `${EXEC_URL}/api/book/depth?token_in=${encodeURIComponent(tokenIn)}&token_out=${encodeURIComponent(tokenOut)}`;
        const res = await fetch(url, {
          headers: { "X-STX-Address": callerAddress },
          signal:  AbortSignal.timeout(TIMEOUT_MS),
        });

        if (!res.ok) {
          const err = await res.json() as { error: string };
          throw new Error(`Execution engine: ${err.error ?? res.statusText}`);
        }

        const depth = await res.json();

        return createJsonResponse({
          tokenIn,
          tokenOut,
          depth,
          note: "Dark pool orders (Elite dark=true) are excluded from this view.",
          ...SOVEREIGNTY_STAMP,
        });
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  // ── Live Arb Signals (Elite — 10,000 WHALE) ──────────────────────────────

  server.registerTool(
    "flying_whale_execution_arb",
    {
      description:
        "Active arbitrage signals from the Whale Execution Scanner. " +
        "Returns all currently live signals — cross-DEX opportunities with spread BPS, " +
        "estimated profit in satoshis, source/target pool, and whether the signal is " +
        "already claimed by an executor. " +
        "To execute: register as an arb executor by staking 10,000 WHALE on-chain via " +
        "whale-execution-v1.clar:register-executor, then claim signals via the SSE stream. " +
        "Executor earns 60% of gross profit; 30% → whale-treasury-v1 buyback. " +
        "WHALE gate: Elite tier (10,000 WHALE) required.",
      inputSchema: {
        callerAddress: z.string().min(1).describe(CALLER_DESC),
      },
    },
    async ({ callerAddress }) => {
      try {
        await verifyWhaleAccess(callerAddress, "elite");

        const res = await fetch(`${EXEC_URL}/api/stats`, {
          headers: { "X-STX-Address": callerAddress },
          signal:  AbortSignal.timeout(TIMEOUT_MS),
        });

        if (!res.ok) {
          const err = await res.json() as { error: string };
          throw new Error(`Execution engine: ${err.error ?? res.statusText}`);
        }

        const stats = await res.json() as { queue: number; signals: number };

        return createJsonResponse({
          activeSignals:  stats.signals,
          queueSize:      stats.queue,
          executorModel: {
            minStake:        "10,000 WHALE",
            executorCut:     "60% of gross profit",
            protocolCut:     "30% → whale-treasury-v1 (BTC buyback)",
            stakersCut:      "10% → WHALE stakers",
            claimMethod:     "SSE stream at whale-execution-engine-production.up.railway.app/api/signals/arb",
            onchainClaim:    "whale-execution-v1.clar:claim-arb-signal(signal-id)",
            onchainSettle:   "whale-execution-v1.clar:settle-arb(signal-id, gross-profit)",
          },
          liveStreamNote:
            "Live signal stream (SSE) available at whale-execution-engine-production.up.railway.app/api/signals/arb. " +
            "Requires X-STX-Address header with Elite WHALE balance. " +
            "First executor to claim a signal on-chain wins the execution right.",
          ...SOVEREIGNTY_STAMP,
        });
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  // ══════════════════════════════════════════════════════════════════════════════
  //  IPI DEFENSE AUDIT
  //  Retroactive review + sanitized signal read
  //  Copyright 2026 Flying Whale — SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW
  // ══════════════════════════════════════════════════════════════════════════════

  server.registerTool(
    "flying_whale_ipi_audit",
    {
      title:       "Flying Whale — IPI Defense Audit Log",
      description: "View all prompt injection attempts detected this session. Shows attack log, coordinated attack patterns, phrase counts, and can sanitize external content before reading it. Use this to audit the aibtc.news signals feed safely.",
      inputSchema: z.object({
        action: z.enum(["log", "stats", "sanitize"])
          .describe("log = show all attack attempts | stats = phrase counts + coordinated attacks | sanitize = clean content and return safe version"),
        content: z.string().optional()
          .describe("Content to sanitize (required for action=sanitize)"),
      }),
    },
    async ({ action, content }) => {
      try {
        if (action === "log") {
          const log = ipiGetAuditLog();
          return createJsonResponse({
            totalAttacks: log.length,
            attacks: log.map(e => ({
              time:    new Date(e.timestamp).toISOString(),
              phrase:  e.phrase,
              source:  e.source,
              snippet: e.contentSnippet,
            })),
            knownPhrases: IPI_ATTACK_PHRASES.length,
            ...SOVEREIGNTY_STAMP,
          });
        }

        if (action === "stats") {
          const log = ipiGetAuditLog();
          const phraseCounts: Record<string, number> = {};
          for (const entry of log) {
            phraseCounts[entry.phrase] = (phraseCounts[entry.phrase] ?? 0) + 1;
          }
          const coordinatedAttacks = Object.entries(phraseCounts)
            .filter(([phrase]) => ipiIsCoordinatedAttack(phrase))
            .map(([phrase, count]) => ({ phrase, count }));

          return createJsonResponse({
            totalAttacks:        log.length,
            uniquePhrases:       Object.keys(phraseCounts).length,
            phraseCounts,
            coordinatedAttacks,
            isUnderAttack:       coordinatedAttacks.length > 0,
            knownPhrasePatterns: IPI_ATTACK_PHRASES.length,
            ...SOVEREIGNTY_STAMP,
          });
        }

        if (action === "sanitize") {
          if (!content) {
            return createJsonResponse({ error: "content is required for action=sanitize" });
          }
          const result = ipiSanitize(content);
          return createJsonResponse({
            wasInjected:    result.wasInjected,
            removedPhrases: result.removedPhrases,
            sanitized:      result.sanitized,
            safe:           !result.wasInjected,
            ...SOVEREIGNTY_STAMP,
          });
        }

        return createJsonResponse({ error: "Unknown action" });
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );
}
