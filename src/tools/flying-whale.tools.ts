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
 * WHALE Access Model — No WHALE = No Access:
 *   Scout  (100 WHALE)    — skill browsing, categories
 *   Agent  (1,000 WHALE)  — intelligence, execution API, analytics
 *   Elite  (10,000 WHALE) — all features + premium data
 *   Council (score ≥ 300) — governance, proposals
 *
 * MCP tools (sovereignty-stamped):
 * - flying_whale_list_skills      — Browse 114 skills across 11 categories
 * - flying_whale_get_skill        — Detailed skill info (pricing, author, args)
 * - flying_whale_list_categories  — All categories with counts
 * - flying_whale_get_stats        — Platform stats (skills, volume, agents)
 * - flying_whale_list_bounties    — Active bounties (task-based rewards)
 * - flying_whale_get_bounty       — Bounty details (reward, deadline, requirements)
 * - flying_whale_list_orders      — Order book (buy/sell for skill trading)
 * - flying_whale_get_intelligence — Intelligence reports and market analytics
 *
 * Execution API: https://whale-execution-api-production.up.railway.app
 * Marketplace:   https://flying-whale-marketplace-production.up.railway.app
 * Buy WHALE:     https://app.bitflow.finance — WHALE/wSTX Pool #42
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createJsonResponse, createErrorResponse } from "../utils/index.js";

const BASE_URL  = "https://flying-whale-marketplace-production.up.railway.app";
const EXEC_URL  = "https://whale-execution-api-production.up.railway.app";
const TIMEOUT_MS = 15_000;

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
// Helpers
// ============================================================================

async function marketplaceFetch(
  path: string,
  query?: Record<string, string | number | undefined>
): Promise<unknown> {
  const url = new URL(path, BASE_URL);
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
        "X-Fw-Agent": "aibtc-mcp-server — Flying Whale Marketplace Skill",
        "X-Fw-Stack": "Multi-Layer Sovereignty Stack v2.0.0",
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
        "114 skills across 11 categories. Requires WHALE token holding for full access " +
        "(Scout: 100 WHALE, Agent: 1,000 WHALE, Elite: 10,000 WHALE). " +
        "Buy WHALE: https://app.bitflow.finance — Pool #42. " +
        "Supports filtering by category, search query, and sorting. Returns skill name, category, price, author, and tags.",
      inputSchema: {
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
    async ({ category, search, sort, limit }) => {
      try {
        const data = await marketplaceFetch("/api/skills", {
          category,
          search,
          sort,
          limit,
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
        "including pricing, author, arguments, requirements, and usage examples.",
      inputSchema: {
        skillId: z
          .string()
          .min(1)
          .describe(
            "The skill identifier (e.g. 'wallet', 'sbtc-bridge', 'hodlmm-pulse')"
          ),
      },
    },
    async ({ skillId }) => {
      try {
        const data = await marketplaceFetch(`/api/skills/${encodeURIComponent(skillId)}`);
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
        "List all skill categories on the Flying Whale Marketplace with skill counts per category.",
      inputSchema: {},
    },
    async () => {
      try {
        const data = await marketplaceFetch("/api/categories");
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
        "Full stats require Agent tier (1,000 WHALE). Buy: https://app.bitflow.finance",
      inputSchema: {},
    },
    async () => {
      try {
        const data = await marketplaceFetch("/api/stats");
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
        "that agents can claim and complete for BTC/STX payments.",
      inputSchema: {
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
    async ({ status, category }) => {
      try {
        const data = await marketplaceFetch("/api/bounties", {
          status,
          category,
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
        "reward amount, deadline, and submission status.",
      inputSchema: {
        bountyId: z
          .string()
          .min(1)
          .describe("The bounty identifier"),
      },
    },
    async ({ bountyId }) => {
      try {
        const data = await marketplaceFetch(
          `/api/bounties/${encodeURIComponent(bountyId)}`
        );
        return createJsonResponse(data);
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  // ---------- Order Book ----------

  server.registerTool(
    "flying_whale_list_orders",
    {
      description:
        "View the Flying Whale order book. Shows buy and sell orders for skill trading " +
        "with price, quantity, and order type.",
      inputSchema: {
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
    async ({ market, side, limit }) => {
      try {
        const data = await marketplaceFetch("/api/orderbook", {
          market,
          side,
          limit,
        });
        return createJsonResponse(data);
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  // ---------- Intelligence ----------

  server.registerTool(
    "flying_whale_get_intelligence",
    {
      description:
        "Get intelligence reports and market analytics from Flying Whale Sovereign Agent OS " +
        "(COPYRIGHT 2026 Flying Whale — zaghmout.btc | ERC-8004 #54). " +
        "Returns trend data, skill performance metrics, WHALE pool analytics, and on-chain insights. " +
        "Requires Agent tier minimum (1,000 WHALE). Premium intelligence requires Elite (10,000 WHALE). " +
        "Execution API: https://whale-execution-api-production.up.railway.app — Multi-Layer Sovereignty Stack v2.0.0.",
      inputSchema: {
        limit: z
          .number()
          .min(1)
          .max(50)
          .optional()
          .describe("Max reports to return (default: 10)"),
      },
    },
    async ({ limit }) => {
      try {
        const data = await marketplaceFetch("/api/intelligence/recent", {
          limit,
        });
        return createJsonResponse(data);
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );
}
