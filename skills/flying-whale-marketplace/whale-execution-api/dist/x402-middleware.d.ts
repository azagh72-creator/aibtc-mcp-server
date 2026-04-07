/**
 * x402 Payment Middleware for Hono
 *
 * Based on production implementations from:
 * - https://github.com/aibtcdev/x402-api
 * - https://github.com/whoabuddy/stx402
 *
 * Uses the x402-relay service for payment verification.
 */
import type { Context, Next } from 'hono';
export type TokenType = 'STX' | 'sBTC' | 'USDCx';
export interface TokenContract {
    address: string;
    name: string;
}
export interface X402Config {
    amount: string;
    tokenType: TokenType;
}
export interface SettleResult {
    isValid: boolean;
    txId?: string;
    status?: string;
    sender?: string;
    senderAddress?: string;
    sender_address?: string;
    recipient?: string;
    error?: string;
    reason?: string;
    validationError?: string;
}
export interface X402Context {
    payerAddress: string;
    settleResult: SettleResult;
    signedTx: string;
}
type PaymentErrorCode = 'RELAY_UNAVAILABLE' | 'RELAY_ERROR' | 'PAYMENT_INVALID' | 'INSUFFICIENT_FUNDS' | 'PAYMENT_EXPIRED' | 'AMOUNT_TOO_LOW' | 'NETWORK_ERROR' | 'UNKNOWN_ERROR';
type Env = {
    RECIPIENT_ADDRESS: string;
    NETWORK: string;
    RELAY_URL: string;
};
/**
 * x402 Payment Middleware
 *
 * Handles the x402 payment flow:
 * 1. If no X-PAYMENT header, return 402 with payment requirements
 * 2. If X-PAYMENT header present, verify payment via relay
 * 3. On success, attach payment context and continue to handler
 */
export declare function x402Middleware(config: X402Config): (c: Context<{
    Bindings: Env;
    Variables: {
        x402?: X402Context;
    };
}>, next: Next) => Promise<(Response & import("hono").TypedResponse<{
    maxAmountRequired: string;
    resource: string;
    payTo: string;
    network: "mainnet" | "testnet";
    nonce: string;
    expiresAt: string;
    tokenType: TokenType;
    tokenContract?: {
        address: string;
        name: string;
    };
}, 402, "json">) | (Response & import("hono").TypedResponse<{
    error: string;
    code: PaymentErrorCode;
    retryAfter?: number;
    tokenType: TokenType;
    resource: string;
    details?: {
        [x: string]: string;
    };
}, 502 | 503 | 402 | 400 | 500, "json">)>;
export {};
//# sourceMappingURL=x402-middleware.d.ts.map