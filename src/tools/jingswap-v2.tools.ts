/**
 * Jingswap V2 Limit-Price Auction MCP Tools
 *
 * COPYRIGHT 2026 Flying Whale — zaghmout.btc | ERC-8004 #54 | ALL RIGHTS RESERVED
 * Flying Whale Proprietary License v3.0 — Agreement-First Policy
 * Owner: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW
 * BTC:   bc1qdfm56pmmq40me84aau2fts3725ghzqlwf6ys7p
 * On-chain IP: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-ip-store-v1
 *
 * V2 vs V1 Improvements:
 *   - 2-phase lifecycle (vs V1's 3-phase): deposit → settle (no buffer)
 *   - Mandatory limit prices on deposits (sats/STX floor/ceiling)
 *   - Atomic close-and-settle-with-refresh (single tx, no stuck cycles)
 *   - 20-second deposit window vs V1's 5-minute window
 *   - set-stx-limit / set-sbtc-limit for mid-cycle adjustments
 *   - Clearing preview simulation before committing
 *
 * Markets:
 *   sbtc-stx-market          → SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22.sbtc-stx-0-jing-v2
 *   sbtc-stx-20bp-stx-premium → SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22.sbtc-stx-20-jing-v2
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  uintCV,
  bufferCV,
  contractPrincipalCV,
  PostConditionMode,
  Pc,
} from "@stacks/transactions";
import { getAccount, NETWORK } from "../services/x402.service.js";
import { callContract } from "../transactions/builder.js";
import { getExplorerTxUrl } from "../config/networks.js";
import { createJsonResponse, createErrorResponse } from "../utils/index.js";

// ── Constants ───────────────────────────────────────────────────────────────

const JINGSWAP_API =
  process.env.JINGSWAP_API_URL || "https://faktory-dao-backend.vercel.app";
const JINGSWAP_API_KEY =
  process.env.JINGSWAP_API_KEY ||
  "jc_b058d7f2e0976bd4ee34be3e5c7ba7ebe45289c55d3f5e45f666ebc14b7ebfd0";

const JINGSWAP_CONTRACT_ADDRESS = "SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22";
const SBTC_CONTRACT = "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token";

/** Pyth oracle contracts — shared with V1 */
const PYTH = {
  storage: { address: "SP1CGXWEAMG6P6FT04W66NVGJ7PQWMDAC19R7PJ0Y", name: "pyth-storage-v4" },
  decoder: { address: "SP1CGXWEAMG6P6FT04W66NVGJ7PQWMDAC19R7PJ0Y", name: "pyth-pnau-decoder-v3" },
  wormhole: { address: "SP1CGXWEAMG6P6FT04W66NVGJ7PQWMDAC19R7PJ0Y", name: "wormhole-core-v4" },
};

// ── Market Configuration ─────────────────────────────────────────────────────

interface V2MarketConfig {
  contractName: string;
  slug: string;
  premium: string;
  description: string;
}

const V2_MARKETS: Record<string, V2MarketConfig> = {
  "sbtc-stx-market": {
    contractName: "sbtc-stx-0-jing-v2",
    slug: "sbtc-stx-market",
    premium: "0%",
    description: "Standard sBTC/STX market — oracle clearing price, no premium",
  },
  "sbtc-stx-20bp-stx-premium": {
    contractName: "sbtc-stx-20-jing-v2",
    slug: "sbtc-stx-20bp-stx-premium",
    premium: "0.20% STX bonus",
    description: "Premium sBTC/STX market — STX depositors receive 0.20% bonus over oracle price",
  },
};

const V2_DEFAULT_MARKET = "sbtc-stx-market";

function getV2Market(market?: string): V2MarketConfig {
  const key = market || V2_DEFAULT_MARKET;
  const config = V2_MARKETS[key];
  if (!config) {
    throw new Error(
      `Unknown V2 market "${key}". Available: ${Object.keys(V2_MARKETS).join(", ")}`
    );
  }
  return config;
}

function v2ContractParam(m: V2MarketConfig): string {
  return m.slug === V2_DEFAULT_MARKET ? "" : `?contract=${m.contractName}`;
}

// ── API Helper ────────────────────────────────────────────────────────────────

async function jingswapV2Get(path: string): Promise<unknown> {
  const res = await fetch(`${JINGSWAP_API}${path}`, {
    headers: { "x-api-key": JINGSWAP_API_KEY },
  });
  if (!res.ok) throw new Error(`Jingswap V2 API ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { success: boolean; data: unknown; message?: string };
  if (!json.success) throw new Error(json.message || "Jingswap V2 API returned failure");
  return json.data;
}

/**
 * Compute a safe default limit price (20% in-the-money vs current oracle).
 * For STX depositors: max sats/STX they accept = oracle price × 1.20 (pay up to 20% above).
 * For sBTC depositors: min sats/STX they accept = oracle price × 0.80 (receive at least 80%).
 */
async function getDefaultLimitPrice(
  market: V2MarketConfig,
  side: "stx" | "sbtc"
): Promise<bigint> {
  const data = (await jingswapV2Get(
    `/api/v2/auction/pyth-prices${v2ContractParam(market)}`
  )) as { satsPerStx?: number; stxPerBtc?: number };

  // satsPerStx: how many sats one STX buys at current oracle
  const oracleSatsPerStx = data.satsPerStx ?? 0;
  if (oracleSatsPerStx <= 0) {
    throw new Error("Cannot compute default limit price — oracle price unavailable");
  }

  if (side === "stx") {
    // STX depositor: willing to pay UP TO 20% above oracle (generous ceiling)
    return BigInt(Math.ceil(oracleSatsPerStx * 1.2));
  } else {
    // sBTC depositor: willing to receive AT LEAST 80% of oracle (conservative floor)
    return BigInt(Math.floor(oracleSatsPerStx * 0.8));
  }
}

// ── Tool Registration ─────────────────────────────────────────────────────────

export function registerJingswapV2Tools(server: McpServer): void {

  // ══════════════════════════════════════════════════════════════════
  // QUERY TOOLS (read-only)
  // ══════════════════════════════════════════════════════════════════

  server.registerTool(
    "jingswap_v2_get_cycle_state",
    {
      description:
        "Get the current Jingswap V2 auction cycle state. " +
        "V2 is a 2-phase system: phase 0 = deposit (open, ~10 blocks / ~20 sec), " +
        "phase 1 = settle (call close-and-settle-with-refresh). No buffer phase. " +
        "Returns phase, blocksElapsed, cycle totals, and minimum deposit requirements. " +
        "Start here to understand the current auction status before depositing.",
      inputSchema: {
        market: z
          .string()
          .optional()
          .describe(
            'V2 market: "sbtc-stx-market" (default, 0% premium) or "sbtc-stx-20bp-stx-premium" (0.20% STX bonus)'
          ),
      },
    },
    async ({ market }) => {
      try {
        const m = getV2Market(market);
        const data = await jingswapV2Get(`/api/v2/auction/cycle-state${v2ContractParam(m)}`);
        return createJsonResponse({
          ...(data as object),
          market: m.slug,
          premium: m.premium,
          _hint: {
            phases: "0 = deposit (open for deposits), 1 = settle (call close-and-settle-with-refresh)",
            depositWindow: "~10 blocks / ~20 seconds (Nakamoto block time)",
            cancelThreshold: "~42 blocks / ~84 seconds after deposit closes",
            v2Advantage: "No buffer phase — go straight from deposit to settle",
            sbtcUnits: "satoshis (÷1e8 for BTC)",
            stxUnits: "micro-STX (÷1e6 for STX)",
          },
        });
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  server.registerTool(
    "jingswap_v2_get_user_deposit",
    {
      description:
        "Get a user's deposit amounts (STX and sBTC) and limit prices for a given V2 auction cycle. " +
        "Returns deposit amounts, limit prices set, and current status.",
      inputSchema: {
        cycle: z.number().int().nonnegative().describe("Cycle number to query"),
        address: z.string().describe("Stacks address of the depositor"),
        market: z
          .string()
          .optional()
          .describe('V2 market: "sbtc-stx-market" (default) or "sbtc-stx-20bp-stx-premium"'),
      },
    },
    async ({ cycle, address, market }) => {
      try {
        const m = getV2Market(market);
        const data = await jingswapV2Get(
          `/api/v2/auction/deposit/${cycle}/${address}${v2ContractParam(m)}`
        );
        return createJsonResponse({ ...(data as object), market: m.slug });
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  server.registerTool(
    "jingswap_v2_get_clearing_preview",
    {
      description:
        "Simulate the V2 limit-price clearing at the current oracle price without executing. " +
        "Shows which deposits would clear, estimated fill amounts, and projected clearing price. " +
        "Use this before settling to understand expected outcomes. Read-only — no transaction.",
      inputSchema: {
        market: z
          .string()
          .optional()
          .describe('V2 market: "sbtc-stx-market" (default) or "sbtc-stx-20bp-stx-premium"'),
      },
    },
    async ({ market }) => {
      try {
        const m = getV2Market(market);
        const data = await jingswapV2Get(
          `/api/v2/auction/clearing-preview${v2ContractParam(m)}`
        );
        return createJsonResponse({
          ...(data as object),
          market: m.slug,
          premium: m.premium,
          _hint: {
            note: "Simulation only — oracle price may change before actual settlement",
            limitFiltering:
              "STX deposits above limit price are excluded; sBTC deposits below limit price are excluded",
          },
        });
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  server.registerTool(
    "jingswap_v2_get_prices",
    {
      description:
        "Get current Pyth oracle and DEX prices for the V2 auction. " +
        "Returns BTC/USD, STX/USD (oracle), XYK pool price, DLMM price, and derived sats/STX ratio. " +
        "Use this to understand fair value before setting limit prices on deposits.",
      inputSchema: {
        market: z
          .string()
          .optional()
          .describe('V2 market: "sbtc-stx-market" (default) or "sbtc-stx-20bp-stx-premium"'),
      },
    },
    async ({ market }) => {
      try {
        const m = getV2Market(market);
        const [pyth, dex] = await Promise.all([
          jingswapV2Get(`/api/v2/auction/pyth-prices${v2ContractParam(m)}`),
          jingswapV2Get(`/api/v2/auction/dex-price${v2ContractParam(m)}`),
        ]);

        const dexData = dex as {
          xykBalances?: { xBalance: number; yBalance: number };
          dlmmPrice?: number;
        };
        const xykSatsPerStx =
          dexData.xykBalances && dexData.xykBalances.yBalance > 0
            ? Math.round(
                (dexData.xykBalances.xBalance / dexData.xykBalances.yBalance) * 1e2
              ) / 1e2
            : null;
        const dlmmSatsPerStx =
          dexData.dlmmPrice && dexData.dlmmPrice > 0
            ? Math.round(dexData.dlmmPrice * 1e-10 * 1e4) / 1e4
            : null;

        return createJsonResponse({
          market: m.slug,
          premium: m.premium,
          pyth,
          dex: { ...dexData, xykSatsPerStx, dlmmSatsPerStx },
          _hint: {
            xykSatsPerStx: "sats per STX from XYK pool (use as reference for limit prices)",
            dlmmSatsPerStx: "sats per STX from DLMM pool",
            limitPriceTip:
              "STX depositors: set limit ≥ current satsPerStx for better fill probability. " +
              "sBTC depositors: set limit ≤ current satsPerStx.",
          },
        });
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  // ══════════════════════════════════════════════════════════════════
  // DEPOSIT OPERATIONS (write — requires unlocked wallet)
  // ══════════════════════════════════════════════════════════════════

  server.registerTool(
    "jingswap_v2_deposit_stx",
    {
      description:
        "Deposit STX into the current Jingswap V2 auction cycle with a mandatory limit price. " +
        "The limit price (sats/STX) is the MAXIMUM sats you are willing to pay per STX. " +
        "If omitted, defaults to 20% above current oracle price (generous ceiling). " +
        "Only works during deposit phase (phase 0). Amount in human units (e.g. 10 for 10 STX).",
      inputSchema: {
        amount: z.number().positive().describe("STX amount to deposit (human units, e.g. 10 for 10 STX)"),
        limitPrice: z
          .number()
          .int()
          .positive()
          .optional()
          .describe(
            "Limit price in sats/STX — maximum sats you pay per STX. " +
            "Omit to auto-default to oracle price +20% (safe ceiling)."
          ),
        market: z
          .string()
          .optional()
          .describe('V2 market: "sbtc-stx-market" (default) or "sbtc-stx-20bp-stx-premium"'),
      },
    },
    async ({ amount, limitPrice, market }) => {
      try {
        const m = getV2Market(market);

        // Verify deposit phase
        const state = (await jingswapV2Get(
          `/api/v2/auction/cycle-state${v2ContractParam(m)}`
        )) as { phase: number; currentCycle: number };
        if (state.phase !== 0) {
          throw new Error(
            `Cannot deposit — V2 auction is in phase ${state.phase} (settle phase). Wait for next cycle.`
          );
        }

        const account = await getAccount();
        const microStx = BigInt(Math.floor(amount * 1e6));

        // Resolve limit price: explicit or auto-compute 20% in-the-money
        const resolvedLimit = limitPrice
          ? BigInt(limitPrice)
          : await getDefaultLimitPrice(m, "stx");

        const result = await callContract(account, {
          contractAddress: JINGSWAP_CONTRACT_ADDRESS,
          contractName: m.contractName,
          functionName: "deposit-stx",
          functionArgs: [uintCV(microStx), uintCV(resolvedLimit)],
          postConditionMode: PostConditionMode.Deny,
          postConditions: [
            Pc.principal(account.address).willSendEq(microStx).ustx(),
          ],
        });

        return createJsonResponse({
          success: true,
          txid: result.txid,
          action: "deposit-stx",
          amount: `${amount} STX`,
          limitPrice: `${resolvedLimit.toString()} sats/STX${limitPrice ? " (manual)" : " (auto +20% oracle)"}`,
          market: m.slug,
          cycle: state.currentCycle,
          network: NETWORK,
          explorerUrl: getExplorerTxUrl(result.txid, NETWORK),
        });
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  server.registerTool(
    "jingswap_v2_deposit_sbtc",
    {
      description:
        "Deposit sBTC into the current Jingswap V2 auction cycle with a mandatory limit price. " +
        "The limit price (sats/STX) is the MINIMUM sats per STX you are willing to receive. " +
        "If omitted, defaults to 20% below current oracle price (conservative floor). " +
        "Only works during deposit phase (phase 0). Amount in satoshis (e.g. 10000 for 10000 sats).",
      inputSchema: {
        amount: z
          .number()
          .int()
          .positive()
          .describe("sBTC amount in satoshis (e.g. 10000 for 10000 sats / 0.0001 BTC)"),
        limitPrice: z
          .number()
          .int()
          .positive()
          .optional()
          .describe(
            "Limit price in sats/STX — minimum sats you receive per STX. " +
            "Omit to auto-default to oracle price -20% (safe floor)."
          ),
        market: z
          .string()
          .optional()
          .describe('V2 market: "sbtc-stx-market" (default) or "sbtc-stx-20bp-stx-premium"'),
      },
    },
    async ({ amount, limitPrice, market }) => {
      try {
        const m = getV2Market(market);

        const state = (await jingswapV2Get(
          `/api/v2/auction/cycle-state${v2ContractParam(m)}`
        )) as { phase: number; currentCycle: number };
        if (state.phase !== 0) {
          throw new Error(
            `Cannot deposit — V2 auction is in phase ${state.phase} (settle phase). Wait for next cycle.`
          );
        }

        const account = await getAccount();
        const sats = BigInt(amount);
        const resolvedLimit = limitPrice
          ? BigInt(limitPrice)
          : await getDefaultLimitPrice(m, "sbtc");

        const result = await callContract(account, {
          contractAddress: JINGSWAP_CONTRACT_ADDRESS,
          contractName: m.contractName,
          functionName: "deposit-sbtc",
          functionArgs: [uintCV(sats), uintCV(resolvedLimit)],
          postConditionMode: PostConditionMode.Deny,
          postConditions: [
            Pc.principal(account.address)
              .willSendEq(sats)
              .ft(SBTC_CONTRACT as `${string}.${string}`, "sbtc-token"),
          ],
        });

        return createJsonResponse({
          success: true,
          txid: result.txid,
          action: "deposit-sbtc",
          amount: `${amount} sats`,
          limitPrice: `${resolvedLimit.toString()} sats/STX${limitPrice ? " (manual)" : " (auto -20% oracle)"}`,
          market: m.slug,
          cycle: state.currentCycle,
          network: NETWORK,
          explorerUrl: getExplorerTxUrl(result.txid, NETWORK),
        });
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  // ══════════════════════════════════════════════════════════════════
  // LIMIT MANAGEMENT (write — adjust mid-cycle without re-depositing)
  // ══════════════════════════════════════════════════════════════════

  server.registerTool(
    "jingswap_v2_set_stx_limit",
    {
      description:
        "Update your STX deposit limit price mid-cycle without cancelling and re-depositing. " +
        "The limit price is the MAXIMUM sats/STX you are willing to pay. " +
        "Only works if you have an active STX deposit in the current cycle (deposit phase).",
      inputSchema: {
        limitPrice: z
          .number()
          .int()
          .positive()
          .describe("New limit price in sats/STX (maximum sats you will pay per STX)"),
        market: z
          .string()
          .optional()
          .describe('V2 market: "sbtc-stx-market" (default) or "sbtc-stx-20bp-stx-premium"'),
      },
    },
    async ({ limitPrice, market }) => {
      try {
        const m = getV2Market(market);
        const account = await getAccount();

        const result = await callContract(account, {
          contractAddress: JINGSWAP_CONTRACT_ADDRESS,
          contractName: m.contractName,
          functionName: "set-stx-limit",
          functionArgs: [uintCV(BigInt(limitPrice))],
          postConditionMode: PostConditionMode.Deny,
          postConditions: [],
        });

        return createJsonResponse({
          success: true,
          txid: result.txid,
          action: "set-stx-limit",
          newLimitPrice: `${limitPrice} sats/STX`,
          market: m.slug,
          network: NETWORK,
          explorerUrl: getExplorerTxUrl(result.txid, NETWORK),
        });
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  server.registerTool(
    "jingswap_v2_set_sbtc_limit",
    {
      description:
        "Update your sBTC deposit limit price mid-cycle without cancelling and re-depositing. " +
        "The limit price is the MINIMUM sats/STX you are willing to receive. " +
        "Only works if you have an active sBTC deposit in the current cycle (deposit phase).",
      inputSchema: {
        limitPrice: z
          .number()
          .int()
          .positive()
          .describe("New limit price in sats/STX (minimum sats you will receive per STX)"),
        market: z
          .string()
          .optional()
          .describe('V2 market: "sbtc-stx-market" (default) or "sbtc-stx-20bp-stx-premium"'),
      },
    },
    async ({ limitPrice, market }) => {
      try {
        const m = getV2Market(market);
        const account = await getAccount();

        const result = await callContract(account, {
          contractAddress: JINGSWAP_CONTRACT_ADDRESS,
          contractName: m.contractName,
          functionName: "set-sbtc-limit",
          functionArgs: [uintCV(BigInt(limitPrice))],
          postConditionMode: PostConditionMode.Deny,
          postConditions: [],
        });

        return createJsonResponse({
          success: true,
          txid: result.txid,
          action: "set-sbtc-limit",
          newLimitPrice: `${limitPrice} sats/STX`,
          market: m.slug,
          network: NETWORK,
          explorerUrl: getExplorerTxUrl(result.txid, NETWORK),
        });
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  // ══════════════════════════════════════════════════════════════════
  // CANCELLATION (write — deposit phase only)
  // ══════════════════════════════════════════════════════════════════

  server.registerTool(
    "jingswap_v2_cancel_stx",
    {
      description:
        "Cancel your STX deposit from the current V2 auction cycle and receive a full refund. " +
        "Only works during the deposit phase (phase 0). No partial cancellations.",
      inputSchema: {
        market: z
          .string()
          .optional()
          .describe('V2 market: "sbtc-stx-market" (default) or "sbtc-stx-20bp-stx-premium"'),
      },
    },
    async ({ market }) => {
      try {
        const m = getV2Market(market);
        const state = (await jingswapV2Get(
          `/api/v2/auction/cycle-state${v2ContractParam(m)}`
        )) as { phase: number; currentCycle: number };
        if (state.phase !== 0) {
          throw new Error(`Cannot cancel — auction is in phase ${state.phase}, not deposit phase`);
        }

        const account = await getAccount();
        const result = await callContract(account, {
          contractAddress: JINGSWAP_CONTRACT_ADDRESS,
          contractName: m.contractName,
          functionName: "cancel-stx-deposit",
          functionArgs: [],
          postConditionMode: PostConditionMode.Allow,
          postConditions: [],
        });

        return createJsonResponse({
          success: true,
          txid: result.txid,
          action: "cancel-stx-deposit",
          market: m.slug,
          cycle: state.currentCycle,
          network: NETWORK,
          explorerUrl: getExplorerTxUrl(result.txid, NETWORK),
        });
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  server.registerTool(
    "jingswap_v2_cancel_sbtc",
    {
      description:
        "Cancel your sBTC deposit from the current V2 auction cycle and receive a full refund. " +
        "Only works during the deposit phase (phase 0). No partial cancellations.",
      inputSchema: {
        market: z
          .string()
          .optional()
          .describe('V2 market: "sbtc-stx-market" (default) or "sbtc-stx-20bp-stx-premium"'),
      },
    },
    async ({ market }) => {
      try {
        const m = getV2Market(market);
        const state = (await jingswapV2Get(
          `/api/v2/auction/cycle-state${v2ContractParam(m)}`
        )) as { phase: number; currentCycle: number };
        if (state.phase !== 0) {
          throw new Error(`Cannot cancel — auction is in phase ${state.phase}, not deposit phase`);
        }

        const account = await getAccount();
        const result = await callContract(account, {
          contractAddress: JINGSWAP_CONTRACT_ADDRESS,
          contractName: m.contractName,
          functionName: "cancel-sbtc-deposit",
          functionArgs: [],
          postConditionMode: PostConditionMode.Allow,
          postConditions: [],
        });

        return createJsonResponse({
          success: true,
          txid: result.txid,
          action: "cancel-sbtc-deposit",
          market: m.slug,
          cycle: state.currentCycle,
          network: NETWORK,
          explorerUrl: getExplorerTxUrl(result.txid, NETWORK),
        });
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  // ══════════════════════════════════════════════════════════════════
  // SETTLEMENT (write — settle phase only)
  // ══════════════════════════════════════════════════════════════════

  server.registerTool(
    "jingswap_v2_close_and_settle_with_refresh",
    {
      description:
        "Atomically close the deposit window and settle the V2 auction cycle in a single transaction. " +
        "Fetches fresh Pyth oracle VAAs automatically. This is the ONLY settlement method in V2 — " +
        "there is no separate close-deposits call to prevent stuck cycles. " +
        "Distributes cleared sBTC and STX to all qualifying depositors (those within their limit prices). " +
        "Deposits outside limit prices are rolled to the next cycle. " +
        "Call jingswap_v2_get_clearing_preview first to see expected outcomes.",
      inputSchema: {
        market: z
          .string()
          .optional()
          .describe('V2 market: "sbtc-stx-market" (default) or "sbtc-stx-20bp-stx-premium"'),
      },
    },
    async ({ market }) => {
      try {
        const m = getV2Market(market);
        const state = (await jingswapV2Get(
          `/api/v2/auction/cycle-state${v2ContractParam(m)}`
        )) as { phase: number; currentCycle: number };

        // V2 accepts close-and-settle from deposit phase (phase 0) after deposit window
        // The contract itself enforces the minimum deposit block requirement
        if (state.phase !== 0) {
          throw new Error(
            `Cannot settle — auction is in phase ${state.phase}. Already past settle point.`
          );
        }

        // Fetch fresh Pyth VAAs from the backend
        const vaas = (await jingswapV2Get("/api/v2/auction/pyth-vaas")) as {
          btcVaaHex: string;
          stxVaaHex: string;
        };
        const btcVaa = bufferCV(Buffer.from(vaas.btcVaaHex, "hex"));
        const stxVaa = bufferCV(Buffer.from(vaas.stxVaaHex, "hex"));

        const account = await getAccount();
        const result = await callContract(account, {
          contractAddress: JINGSWAP_CONTRACT_ADDRESS,
          contractName: m.contractName,
          functionName: "close-and-settle-with-refresh",
          functionArgs: [
            btcVaa,
            stxVaa,
            contractPrincipalCV(PYTH.storage.address, PYTH.storage.name),
            contractPrincipalCV(PYTH.decoder.address, PYTH.decoder.name),
            contractPrincipalCV(PYTH.wormhole.address, PYTH.wormhole.name),
          ],
          postConditionMode: PostConditionMode.Allow,
          postConditions: [],
        });

        return createJsonResponse({
          success: true,
          txid: result.txid,
          action: "close-and-settle-with-refresh",
          market: m.slug,
          premium: m.premium,
          cycle: state.currentCycle,
          network: NETWORK,
          explorerUrl: getExplorerTxUrl(result.txid, NETWORK),
          _note:
            "Atomic V2 settlement — close + settle in one tx with fresh Pyth oracle prices. " +
            "Deposits outside limit prices are automatically rolled to the next cycle.",
        });
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  server.registerTool(
    "jingswap_v2_cancel_cycle",
    {
      description:
        "Cancel the current V2 auction cycle and roll all deposits to the next cycle. " +
        "Safety valve — can only be called ~42 blocks (~84 seconds) after the deposit window closes " +
        "if settlement has repeatedly failed. No refunds: deposits roll to next cycle automatically. " +
        "Anyone can call this. Prefer jingswap_v2_close_and_settle_with_refresh instead.",
      inputSchema: {
        market: z
          .string()
          .optional()
          .describe('V2 market: "sbtc-stx-market" (default) or "sbtc-stx-20bp-stx-premium"'),
      },
    },
    async ({ market }) => {
      try {
        const m = getV2Market(market);
        const state = (await jingswapV2Get(
          `/api/v2/auction/cycle-state${v2ContractParam(m)}`
        )) as { phase: number; currentCycle: number; blocksElapsed: number };
        if (state.phase === 0 && state.blocksElapsed < 42) {
          throw new Error(
            `Cannot cancel cycle yet — only ${state.blocksElapsed} blocks elapsed. ` +
            `Need at least 42 blocks (~84s) after deposit window closes.`
          );
        }

        const account = await getAccount();
        const result = await callContract(account, {
          contractAddress: JINGSWAP_CONTRACT_ADDRESS,
          contractName: m.contractName,
          functionName: "cancel-cycle",
          functionArgs: [],
          postConditionMode: PostConditionMode.Allow,
          postConditions: [],
        });

        return createJsonResponse({
          success: true,
          txid: result.txid,
          action: "cancel-cycle",
          market: m.slug,
          cycle: state.currentCycle,
          network: NETWORK,
          explorerUrl: getExplorerTxUrl(result.txid, NETWORK),
          _note: "All deposits rolled to next cycle. No refunds issued.",
        });
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );
}
