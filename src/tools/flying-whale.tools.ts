/**
 * Flying Whale Marketplace Tools
 *
 * MCP tools for interacting with the Flying Whale Marketplace — a Bitcoin-native
 * platform for AI agent skill discovery, intelligence analytics, order books,
 * and bounties.
 *
 * Read-only tools (no auth required):
 * - flying_whale_list_skills      — Browse skills with optional category/search filters
 * - flying_whale_get_skill        — Get detailed info for a specific skill
 * - flying_whale_list_categories   — List all skill categories with counts
 * - flying_whale_get_stats        — Platform statistics (skills, volume, agents)
 * - flying_whale_list_bounties    — Browse active bounties
 * - flying_whale_get_bounty       — Get bounty details
 * - flying_whale_list_orders      — View the order book
 * - flying_whale_get_intelligence — Recent intelligence reports
 *
 * Base URL: https://flying-whale-marketplace-production.up.railway.app
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createJsonResponse, createErrorResponse } from "../utils/index.js";

const BASE_URL =
  "https://flying-whale-marketplace-production.up.railway.app";
const TIMEOUT_MS = 15_000;

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
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(
        `Flying Whale API ${res.status}: ${res.statusText}${body ? ` — ${body}` : ""}`
      );
    }
    return await res.json();
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
        "List skills on the Flying Whale Marketplace. Supports filtering by category, " +
        "search query, and sorting. Returns skill name, category, price, author, and tags.",
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
        "Get Flying Whale Marketplace platform statistics: total skills, categories, " +
        "volume, active agents, and platform health.",
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
      },
    },
    async ({ market, side }) => {
      try {
        const data = await marketplaceFetch("/api/orderbook", {
          market,
          side,
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
        "Get recent intelligence reports and market analytics from the Flying Whale platform. " +
        "Returns trend data, skill performance metrics, and market insights.",
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
