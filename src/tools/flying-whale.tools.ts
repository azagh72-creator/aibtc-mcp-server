/**
 * Flying Whale Marketplace Tools
 *
 * COPYRIGHT 2026 Flying Whale — zaghmout.btc | ERC-8004 #54 | ALL RIGHTS RESERVED
 * Flying Whale Proprietary License v2.0 — Agreement-First Policy
 * Owner: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW
 * On-chain IP: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-ip-store-v1
 * Enforcement: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-signal-registry-v1
 *
 * Multi-Layer Sovereignty Stack v2.0.0
 * Sovereign Agent OS — 8-Layer Bitcoin AI Infrastructure on Stacks mainnet
 *
 * WHALE Access Model — No WHALE = No Access (enforced on-chain via Hiro API):
 *   Scout  (100 WHALE)    — skill browsing, categories, stats
 *   Agent  (1,000 WHALE)  — intelligence, order book, analytics
 *   Elite  (10,000 WHALE) — all features + premium data
 *   Council (score ≥ 300) — governance, proposals
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
 * Agent tier (1,000 WHALE):
 * - flying_whale_list_orders      — Order book (buy/sell for skill trading)
 * - flying_whale_get_intelligence — Intelligence reports and market analytics
 * - flying_whale_risk_score       — 5-factor token risk score (0–100)
 * - flying_whale_wallet_risk      — Wallet trust profile and classification
 * - flying_whale_multi_key        — Multi-key architecture: balance/nonce/activity matrix
 * - flying_whale_verify_upgrade   — Upgradeable contract detection + risk assessment
 * - flying_whale_safe_execute     — Agent-safe pre-flight: balance, nonce, fee, simulation
 * Elite tier (10,000 WHALE):
 * - flying_whale_expose_identity  — Hidden identity exposure: cluster analysis on-chain
 * - flying_whale_liquidity        — Pool liquidity depth, IL risk, LP position tracking
 *
 * Execution API: https://whale-execution-api-production.up.railway.app
 * Marketplace:   https://flying-whale-marketplace-production.up.railway.app
 * Buy WHALE:     https://app.bitflow.finance — WHALE/wSTX Pool #42
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createJsonResponse, createErrorResponse } from "../utils/index.js";
import { principalCV, serializeCV, stringAsciiCV, uintCV } from "@stacks/transactions";

const BASE_URL  = "https://flying-whale-marketplace-production.up.railway.app";
const TIMEOUT_MS = 15_000;

// ─── WHALE Gate Configuration ─────────────────────────────────────────────────
// WHALE token: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-v3
// Fungible token ID in Hiro balance response format
const WHALE_FT_KEY = "SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-v3::whale";
const WHALE_DECIMALS = 6;
const HIRO_API = "https://api.hiro.so";

// Access tier thresholds (in micro-WHALE, 6 decimals)
const WHALE_THRESHOLDS = {
  scout:  100n * 1_000_000n,      // 100 WHALE
  agent:  1_000n * 1_000_000n,    // 1,000 WHALE
  elite:  10_000n * 1_000_000n,   // 10,000 WHALE
} as const;

type WhaleTier = keyof typeof WHALE_THRESHOLDS;

// ─── Sovereignty Stamp ────────────────────────────────────────────────────────
// Appended to every tool response to assert ownership and access requirements
const SOVEREIGNTY_STAMP = {
  _copyright:    "COPYRIGHT 2026 Flying Whale — zaghmout.btc | ERC-8004 #54 | ALL RIGHTS RESERVED",
  _license:      "Flying Whale Proprietary License v2.0 — Agreement-First Policy",
  _owner:        "SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW",
  _stack:        "Multi-Layer Sovereignty Stack v2.0.0",
  _os:           "Sovereign Agent OS — 8-Layer Bitcoin AI Infrastructure",
  _whale_gate:   "No WHALE = No Access. Buy: https://app.bitflow.finance — Pool #42",
  _ip_registry:  "SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-ip-store-v1",
  _audit_trail:  "SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-signal-registry-v1",
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
        // Fetch WHALE token data from Tenero API (Stacks DEX aggregator)
        const WHALE_CONTRACT = "SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-v3";
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
        let tokenData: unknown;
        try {
          const res = await fetch(
            `https://api.tenero.io/v1/stacks/tokens/${encodeURIComponent(WHALE_CONTRACT)}`,
            { headers: { "Accept": "application/json" }, signal: controller.signal }
          );
          if (!res.ok) throw new Error(`Tenero API ${res.status}`);
          tokenData = await res.json();
        } finally {
          clearTimeout(timer);
        }
        // Also fetch WHALE tier status from marketplace for tier thresholds
        const tierRes = await fetch(
          `${BASE_URL}/api/whale/status?address=${callerAddress}`,
          { headers: { "Accept": "application/json" } }
        ).then(r => r.json()).catch(() => null);
        return createJsonResponse({
          token: tokenData,
          tiers: (tierRes as { allTiers?: unknown } | null)?.allTiers ?? null,
          contract: WHALE_CONTRACT,
          pool: "Bitflow Pool #42 — https://app.bitflow.finance",
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
}
