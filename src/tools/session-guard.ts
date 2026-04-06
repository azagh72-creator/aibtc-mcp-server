/**
 * session-guard.ts
 * MCP Overthinking Attack Protection Layer
 * COPYRIGHT 2026 Flying Whale - zaghmout.btc | ERC-8004 #54 | ALL RIGHTS RESERVED
 *
 * Defends against MCPTox-class attacks (arxiv March 2026, adversa.ai March 2026):
 * - Cyclic overthinking loops induced by malicious tool servers (142x token amplification)
 * - Denial-of-Wallet: repeated on-chain transactions before hard caps trigger
 * - Sequential tool call explosions draining x402 API budgets
 *
 * Two defense layers:
 *   1. Hard cap on wallet-sensitive calls per session (default: 20)
 *   2. Loop detection: same tool N times consecutively = abort
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// ─── Configuration ────────────────────────────────────────────────────────────

const MAX_WALLET_CALLS_PER_SESSION = 20;
const MAX_TOTAL_CALLS_PER_SESSION = 150;
const LOOP_DETECTION_CONSECUTIVE = 5; // abort if same tool called 5 times in a row
const LOOP_DETECTION_RAPID_WINDOW_MS = 10_000; // 10 seconds
const LOOP_DETECTION_RAPID_COUNT = 8; // 8 calls to same tool within 10s = loop

// ─── Wallet-sensitive tools (on-chain or x402 payment impact) ─────────────────

const WALLET_SENSITIVE: Set<string> = new Set([
  // Direct transactions
  "call_contract",
  "deploy_contract",
  "transfer_stx",
  "transfer_btc",
  "transfer_token",
  "transfer_nft",
  "broadcast_transaction",
  // Wallet operations
  "wallet_unlock",
  "wallet_create",
  "wallet_import",
  "wallet_export",
  // DeFi
  "alex_swap",
  "zest_supply",
  "zest_borrow",
  "zest_withdraw",
  "zest_repay",
  "zest_enable_collateral",
  "stack_stx",
  "extend_stacking",
  "sbtc_deposit",
  "sbtc_withdraw",
  "sbtc_transfer",
  "pillar_send",
  "pillar_fund",
  "pillar_boost",
  "pillar_supply",
  "pillar_unwind",
  // x402 paid endpoints
  "execute_x402_endpoint",
  // Bitcoin
  "psbt_sign",
  "psbt_broadcast",
  "ordinals_buy",
  "ordinals_list_for_sale_submit",
  "ordinals_p2p_create_offer",
  "ordinals_p2p_psbt_swap",
  "transfer_rune",
  "inscribe",
  "inscribe_reveal",
]);

// ─── Session State ─────────────────────────────────────────────────────────────

interface CallRecord {
  tool: string;
  timestamp: number;
}

class SessionGuard {
  private calls: CallRecord[] = [];
  private walletCallCount = 0;
  private readonly sessionStart = Date.now();
  private blocked = false;
  private blockReason = "";

  check(toolName: string): { allowed: boolean; reason?: string } {
    if (this.blocked) {
      return { allowed: false, reason: `Session blocked: ${this.blockReason}` };
    }

    const now = Date.now();
    this.calls.push({ tool: toolName, timestamp: now });

    // 1. Consecutive loop detection
    if (this.calls.length >= LOOP_DETECTION_CONSECUTIVE) {
      const tail = this.calls.slice(-LOOP_DETECTION_CONSECUTIVE);
      if (tail.every((c) => c.tool === toolName)) {
        const reason = `Loop detected: "${toolName}" called ${LOOP_DETECTION_CONSECUTIVE}x consecutively — possible MCPTox attack`;
        this.blocked = true;
        this.blockReason = reason;
        return { allowed: false, reason };
      }
    }

    // 2. Rapid repeat detection (same tool N times in 10 seconds)
    const recentSameTool = this.calls.filter(
      (c) => c.tool === toolName && now - c.timestamp < LOOP_DETECTION_RAPID_WINDOW_MS
    );
    if (recentSameTool.length > LOOP_DETECTION_RAPID_COUNT) {
      const reason = `Rapid loop: "${toolName}" called ${recentSameTool.length}x in ${LOOP_DETECTION_RAPID_WINDOW_MS / 1000}s — possible Denial-of-Wallet`;
      this.blocked = true;
      this.blockReason = reason;
      return { allowed: false, reason };
    }

    // 3. Wallet-sensitive call cap
    if (WALLET_SENSITIVE.has(toolName)) {
      this.walletCallCount++;
      if (this.walletCallCount > MAX_WALLET_CALLS_PER_SESSION) {
        const reason = `Wallet call limit exceeded: ${this.walletCallCount}/${MAX_WALLET_CALLS_PER_SESSION} — session budget protection active`;
        this.blocked = true;
        this.blockReason = reason;
        return { allowed: false, reason };
      }
    }

    // 4. Total session call cap
    if (this.calls.length > MAX_TOTAL_CALLS_PER_SESSION) {
      const reason = `Session call limit: ${this.calls.length}/${MAX_TOTAL_CALLS_PER_SESSION} total calls — possible runaway agent`;
      this.blocked = true;
      this.blockReason = reason;
      return { allowed: false, reason };
    }

    return { allowed: true };
  }

  stats(): {
    totalCalls: number;
    walletCalls: number;
    sessionDurationMs: number;
    blocked: boolean;
    blockReason: string;
  } {
    return {
      totalCalls: this.calls.length,
      walletCalls: this.walletCallCount,
      sessionDurationMs: Date.now() - this.sessionStart,
      blocked: this.blocked,
      blockReason: this.blockReason,
    };
  }
}

// Singleton guard per process (one MCP session = one process)
const guard = new SessionGuard();

// ─── MCP Server Wrapper ────────────────────────────────────────────────────────

/**
 * Wraps server.registerTool to inject session guard checks before each tool handler.
 * Call this BEFORE registering any tools.
 * Returns a cleanup function.
 *
 * Usage:
 *   const cleanup = withSessionGuard(server);
 *   registerAllTools(server);
 *   // cleanup() to restore
 */
export function withSessionGuard(server: McpServer): () => void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const original = (server as any).registerTool;
  const hasOwn = Object.prototype.hasOwnProperty.call(server, "registerTool");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (server as any).registerTool = function (
    name: string,
    config: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler: (...args: any[]) => any
  ) {
    // Wrap the handler with guard check
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const guardedHandler = async (...args: any[]) => {
      const check = guard.check(name);
      if (!check.allowed) {
        // Return error in MCP tool response format
        return {
          content: [
            {
              type: "text",
              text: `🛡️ SESSION GUARD BLOCKED\n\n${check.reason}\n\nThis protection prevents MCP Overthinking Attacks (MCPTox / adversa.ai March 2026) that amplify token consumption 142x and can drain wallet budgets via repeated on-chain calls.\n\nSession stats: ${JSON.stringify(guard.stats(), null, 2)}`,
            },
          ],
          isError: true,
        };
      }
      return handler(...args);
    };

    return original.call(server, name, config, guardedHandler);
  };

  return () => {
    if (hasOwn) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (server as any).registerTool = original;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (server as any).registerTool;
    }
  };
}

export { guard, WALLET_SENSITIVE, MAX_WALLET_CALLS_PER_SESSION };
