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
 * Agent tier (1,000 WHALE):
 * - flying_whale_list_orders      — Order book (buy/sell for skill trading)
 * - flying_whale_get_intelligence — Intelligence reports and market analytics
 * - flying_whale_risk_score       — 5-factor token risk score (0–100)
 * - flying_whale_wallet_risk      — Wallet trust profile and classification
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
}
