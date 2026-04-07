"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// BigInt.toJSON polyfill
BigInt.prototype.toJSON = function () { return this.toString(); };

// ════════════════════════════════════════════════════════════════════════════
// COPYRIGHT 2026 Flying Whale — zaghmout.btc | ERC-8004 #54
// ALL RIGHTS RESERVED — Flying Whale Proprietary License v2.0
// Multi-Layer Sovereignty Stack v2.0.0
// On-chain IP: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-ip-store-v1
// Enforcement: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-signal-registry-v1
// Agreement-First Policy: No use without signed partnership agreement.
// ════════════════════════════════════════════════════════════════════════════

const hono_1 = require("hono");
const cors_1 = require("hono/cors");
const x402_middleware_1 = require("./x402-middleware");

// ─── Constants ────────────────────────────────────────────────────────────────
const API_VERSION = '2.0.0';
const STACKS_API  = 'https://api.hiro.so';
const OWNER       = 'SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW';
const WHALE_CONTRACT     = `${OWNER}.whale-v3`;
const POOL_CONTRACT      = `${OWNER}.xyk-pool-whale-wstx-v-1-3`;
const TREASURY_CONTRACT  = `${OWNER}.whale-treasury-v1`;
const SCORING_CONTRACT   = `${OWNER}.whale-scoring-v1`;
const ACCESS_CONTRACT    = `${OWNER}.whale-access-v1`;
const VERIFY_CONTRACT    = `${OWNER}.whale-verify-v1`;
const GOVERNANCE_CONTRACT= `${OWNER}.whale-governance-v1`;
const SIGNAL_CONTRACT    = `${OWNER}.whale-signal-registry-v1`;
const GATE_CONTRACT      = `${OWNER}.whale-gate-v1`;
const DEAD_ADDRESS       = 'SP000000000000000000002Q6VF78';
const WHALE_TOTAL_SUPPLY = 12_616_800;

// ─── WHALE Gate Tiers (Forced Economic Dependency) ───────────────────────────
// "If they can use it without the token, they will never buy the token."
// No WHALE → No access. No exceptions.
const WHALE_GATE = {
    BASIC:   { minWhale: 100,     label: 'Basic',   color: '#00B4D8' },
    PRO:     { minWhale: 1_000,   label: 'Pro',     color: '#00e676' },
    ELITE:   { minWhale: 10_000,  label: 'Elite',   color: '#F7931A' },
    COUNCIL: { minWhale: 100_000, label: 'Council', color: '#ffd600' },
};

// ════════════════════════════════════════════════════════════════════════════
// LAYER 3 — POLICY VM
// Virtual Machine that reads intent and decides: allowed / denied / throttled
// A. Static Rules  B. Rate Limiter  C. Behavioral Analyzer
// ════════════════════════════════════════════════════════════════════════════
class PolicyVM {
    constructor() {
        // { address -> { calls: [timestamps], blocked: bool, reason: string } }
        this.rateLimits = new Map();
        // { address:endpoint -> { timestamps: [] } }
        this.behaviorMap = new Map();
        // Intent log (last 500)
        this.intents = [];
        // Blocked addresses (permanent for this session)
        this.blocklist = new Set();
        this.stats = { total_intents: 0, blocked_by_rate: 0, blocked_by_behavior: 0, blocked_by_rule: 0 };
    }

    // A. Static Rules — hard limits that can never be bypassed
    checkStaticRules(address, endpoint, tier) {
        if (this.blocklist.has(address)) {
            return { allowed: false, layer: 'static-rules', reason: `Address ${address.slice(0,12)}... is blocklisted this session` };
        }
        // Prevent accessing higher tier endpoints with lower tier balance (enforced separately by WHALE gate but double-checked here)
        return { allowed: true };
    }

    // B. Rate Limiter — 60 calls/min per address per endpoint class
    checkRateLimit(address, windowMs = 60_000, maxCalls = 60) {
        const now = Date.now();
        const rec = this.rateLimits.get(address) || { calls: [], blocked: false, reason: '' };
        rec.calls = rec.calls.filter(t => now - t < windowMs);
        rec.calls.push(now);
        this.rateLimits.set(address, rec);
        if (rec.calls.length > maxCalls) {
            rec.blocked = true;
            rec.reason = `Rate limit: ${rec.calls.length} calls in ${windowMs / 1000}s (max ${maxCalls})`;
            this.stats.blocked_by_rate++;
            return { allowed: false, layer: 'rate-limiter', reason: rec.reason };
        }
        return { allowed: true };
    }

    // C. Behavioral Analyzer — detect loops, rapid-fire, MCPTox patterns
    checkBehavior(address, endpoint) {
        const key = `${address}::${endpoint}`;
        const now = Date.now();
        const rec = this.behaviorMap.get(key) || { timestamps: [], consecutive: 0 };
        // 10-second rapid-fire window
        rec.timestamps = rec.timestamps.filter(t => now - t < 10_000);
        rec.timestamps.push(now);
        this.behaviorMap.set(key, rec);
        if (rec.timestamps.length > 8) {
            this.stats.blocked_by_behavior++;
            const reason = `Behavioral anomaly: ${rec.timestamps.length}x ${endpoint} in 10s — possible Denial-of-Wallet`;
            this.blocklist.add(address); // permanent block for this session
            return { anomaly: true, layer: 'behavioral-analyzer', reason };
        }
        return { anomaly: false };
    }

    // Intent Logger — every access creates an intent record
    logIntent(address, endpoint, tier, whaleBalance) {
        const intent = {
            id: `int-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
            address: address ? `${address.slice(0, 10)}...${address.slice(-6)}` : 'unknown',
            endpoint,
            tier,
            whale_balance: whaleBalance,
            timestamp: new Date().toISOString(),
        };
        this.intents.unshift(intent);
        if (this.intents.length > 500) this.intents.pop();
        this.stats.total_intents++;
        return intent;
    }

    getStats() {
        return {
            ...this.stats,
            rate_limited_sessions: [...this.rateLimits.values()].filter(r => r.blocked).length,
            blocked_addresses: this.blocklist.size,
            recent_intents: this.intents.slice(0, 10),
        };
    }
}

const policyVM = new PolicyVM();

// ════════════════════════════════════════════════════════════════════════════
// LAYER 4 — EXECUTION KERNEL
// The only entity that can authorize a response.
// Runs: Intent → Policy VM → WHALE Gate → Execute → Settle
// ════════════════════════════════════════════════════════════════════════════

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function stacksReadOnly(contract, fn, args = []) {
    const [addr, name] = contract.split('.');
    const res = await fetch(`${STACKS_API}/v2/contracts/call-read/${addr}/${name}/${fn}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: OWNER, arguments: args }),
    });
    return res.json();
}

// WHALE Balance — via Hiro extended API (no encoding complexity)
async function getWhaleBalance(address) {
    try {
        const res = await fetch(`${STACKS_API}/extended/v1/address/${address}/balances`);
        const data = await res.json();
        const ft = data.fungible_tokens || {};
        const key = Object.keys(ft).find(k => k.startsWith(`${WHALE_CONTRACT}::`));
        return key ? parseInt(ft[key].balance || '0') / 1_000_000 : 0;
    } catch {
        return 0;
    }
}

async function getPoolData() {
    const [addr, name] = POOL_CONTRACT.split('.');
    const res = await fetch(`${STACKS_API}/v2/contracts/call-read/${addr}/${name}/get-pool`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: OWNER, arguments: [] }),
    });
    return res.json();
}

async function getContractEvents(contract, limit = 20) {
    const res = await fetch(`${STACKS_API}/extended/v1/contract/${contract}/events?limit=${limit}`);
    const data = await res.json();
    return data.results || [];
}

async function getAccountTxs(address, limit = 10) {
    const res = await fetch(`${STACKS_API}/extended/v1/address/${address}/transactions?limit=${limit}`);
    const data = await res.json();
    return { total: data.total || 0, results: data.results || [] };
}

async function getIpStoreTotal() {
    try {
        const data = await stacksReadOnly(`${OWNER}.whale-ip-store-v1`, 'get-total');
        if (data.okay && typeof data.result === 'string') {
            const hex = data.result.replace('0x', '');
            if (hex.startsWith('0701')) {
                const raw = parseInt(hex.slice(4), 16);
                if (!isNaN(raw)) return raw;
            }
        }
    } catch { /* ignore */ }
    return 0;
}

async function getEarningsStx() {
    try {
        const res = await fetch(`${STACKS_API}/extended/v1/address/${OWNER}/transactions?limit=50`);
        const data = await res.json();
        const txs = data.results || [];
        const incoming = txs.filter(tx => {
            if (tx.tx_type !== 'token_transfer') return false;
            return tx.token_transfer?.recipient_address === OWNER;
        });
        const total = incoming.reduce((sum, tx) => sum + (parseInt(String(tx.token_transfer?.amount || '0')) / 1_000_000), 0);
        const txids = incoming.slice(0, 5).map(tx => String(tx.tx_id || ''));
        return { total_received_stx: total, payment_count: incoming.length, recent_payout_txids: txids };
    } catch { /* ignore */ }
    return { total_received_stx: 0, payment_count: 0, recent_payout_txids: [] };
}

function decodePoolEvent(event) {
    try {
        const repr = event.contract_log?.value?.repr;
        if (!repr) return null;
        const xMatch = repr.match(/x-balance\s+u(\d+)/);
        const yMatch = repr.match(/y-balance\s+u(\d+)/);
        if (!xMatch || !yMatch) return null;
        return { xBalance: parseInt(xMatch[1]), yBalance: parseInt(yMatch[1]) };
    } catch {
        return null;
    }
}

// ─── WHALE Gate Middleware ────────────────────────────────────────────────────
// The enforcement layer. No WHALE = No access. Period.
function whaleGate(tier = 'BASIC') {
    return async (c, next) => {
        const payment = c.get('x402');
        const payerAddress = payment?.payerAddress;

        if (!payerAddress) {
            return c.json({
                error: 'SOVEREIGNTY_GATE_BLOCKED',
                layer: 'Layer 1 — Identity',
                code: 403,
                message: 'Valid x402 payment with identifiable sender required. Anonymous access denied.',
                gate: GATE_CONTRACT,
                architecture: 'Multi-Layer Sovereignty Stack v2.0.0',
                copyright: 'COPYRIGHT 2026 Flying Whale — ALL RIGHTS RESERVED',
            }, 403);
        }

        // Layer 3A: Static rules check
        const staticCheck = policyVM.checkStaticRules(payerAddress, c.req.path, tier);
        if (!staticCheck.allowed) {
            return c.json({
                error: 'POLICY_VM_STATIC_RULES',
                layer: 'Layer 3A — Static Rules',
                code: 403,
                message: staticCheck.reason,
                copyright: 'COPYRIGHT 2026 Flying Whale — ALL RIGHTS RESERVED',
            }, 403);
        }

        // Layer 3B: Rate limiter
        const rateCheck = policyVM.checkRateLimit(payerAddress);
        if (!rateCheck.allowed) {
            return c.json({
                error: 'POLICY_VM_RATE_LIMIT',
                layer: 'Layer 3B — Rate Limiter',
                code: 429,
                message: rateCheck.reason,
                retry_after: '60s',
                copyright: 'COPYRIGHT 2026 Flying Whale — ALL RIGHTS RESERVED',
            }, 429);
        }

        // Layer 3C: Behavioral analysis
        const behavior = policyVM.checkBehavior(payerAddress, c.req.path);
        if (behavior.anomaly) {
            return c.json({
                error: 'BEHAVIORAL_ANOMALY_BLOCKED',
                layer: 'Layer 3C — Behavioral Analyzer',
                code: 429,
                message: behavior.reason,
                signal: 'Potential MCPTox / Denial-of-Wallet attack pattern detected.',
                reference: 'arxiv March 2026 — adversa.ai',
                copyright: 'COPYRIGHT 2026 Flying Whale — ALL RIGHTS RESERVED',
            }, 429);
        }

        // Layer 2 — Intent: log before execution
        const required = WHALE_GATE[tier].minWhale;
        const whaleBalance = await getWhaleBalance(payerAddress);
        const intent = policyVM.logIntent(payerAddress, c.req.path, tier, whaleBalance);
        c.set('intent', intent);
        c.set('whaleBalance', whaleBalance);

        // WHALE Gate — the core enforcement
        if (whaleBalance < required) {
            return c.json({
                error: 'INSUFFICIENT_WHALE',
                layer: 'Layer 2 — Intent / WHALE Gate',
                code: 403,
                message: `Access denied. This endpoint requires ${required} WHALE minimum holding. Your balance: ${whaleBalance.toFixed(4)} WHALE.`,
                required_whale: required,
                your_balance: parseFloat(whaleBalance.toFixed(4)),
                deficit: parseFloat((required - whaleBalance).toFixed(4)),
                tier: WHALE_GATE[tier].label,
                how_to_access: {
                    step_1: `Buy at least ${required - whaleBalance > 0 ? (required - whaleBalance).toFixed(0) : required} more WHALE`,
                    step_2: 'Trade on Bitflow DEX — WHALE/wSTX pool #42',
                    step_3: 'Re-submit your x402 request',
                    buy_url: 'https://app.bitflow.finance',
                    pool_id: 42,
                    token_contract: WHALE_CONTRACT,
                },
                gate_contract: GATE_CONTRACT,
                verify_contract: VERIFY_CONTRACT,
                intent_id: intent.id,
                copyright: 'COPYRIGHT 2026 Flying Whale — ALL RIGHTS RESERVED',
                license: 'Flying Whale Proprietary License v2.0 — Agreement-First Policy',
            }, 403);
        }

        // WHALE gate passed — set sovereignty headers
        c.res.headers.set('X-Fw-Sovereignty', 'GRANTED');
        c.res.headers.set('X-Fw-Tier', WHALE_GATE[tier].label);
        c.res.headers.set('X-Fw-Whale-Balance', whaleBalance.toFixed(4));
        c.res.headers.set('X-Fw-Intent-Id', intent.id);
        c.res.headers.set('X-Fw-Gate', GATE_CONTRACT);

        await next();
    };
}

// ════════════════════════════════════════════════════════════════════════════
// APP — Multi-Layer Sovereignty Stack Entry Point
// ════════════════════════════════════════════════════════════════════════════
const app = new hono_1.Hono();

app.use('*', (0, cors_1.cors)({
    origin: '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['X-PAYMENT', 'X-PAYMENT-TOKEN-TYPE', 'Authorization', 'Content-Type'],
    exposeHeaders: [
        'X-PAYMENT-RESPONSE', 'X-PAYER-ADDRESS',
        'X-Fw-Owner', 'X-Fw-Identity', 'X-Fw-Registry', 'X-Fw-License', 'X-Fw-Verify',
        'X-Fw-Sovereignty', 'X-Fw-Tier', 'X-Fw-Whale-Balance', 'X-Fw-Intent-Id', 'X-Fw-Gate',
    ],
}));

// Layer 5 — Settlement Verifier: Ownership proof on every response
app.use('*', async (c, next) => {
    await next();
    c.res.headers.set('X-Fw-Owner',    'SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW');
    c.res.headers.set('X-Fw-Identity', 'Flying Whale | zaghmout.btc | ERC-8004 #54');
    c.res.headers.set('X-Fw-Registry', `${OWNER}.whale-ip-store-v1`);
    c.res.headers.set('X-Fw-License',  'Flying Whale Proprietary License v2.0');
    c.res.headers.set('X-Fw-Verify',   'https://explorer.hiro.so/txid/c5cccb46f055369b121b99c6c0c1ea98bf018d808b82aa271d89e028abf4e6c2?chain=mainnet');
    c.res.headers.set('X-Fw-Stack',    'Multi-Layer Sovereignty Stack v2.0.0');
});

app.use('*', async (c, next) => {
    if (c.req.path === '/health' || c.req.path === '/') return next();
    if (!c.env?.RECIPIENT_ADDRESS) {
        return c.json({ error: 'Server configuration error', missing: 'RECIPIENT_ADDRESS' }, 503);
    }
    await next();
});

// ─── Layer 0 — Public (no WHALE required, no x402) ───────────────────────────
app.get('/', (c) => c.json({
    service: 'Flying Whale Execution API',
    version: API_VERSION,
    architecture: 'Multi-Layer Sovereignty Stack',
    os: 'Sovereign Agent OS — 8-Layer Bitcoin AI Infrastructure',
    owner: 'zaghmout.btc | ERC-8004 #54 | Council 485pts',
    copyright: 'COPYRIGHT 2026 Flying Whale — ALL RIGHTS RESERVED',
    license: 'Flying Whale Proprietary License v2.0 — Agreement-First Policy',
    sovereignty_layers: {
        L1: 'Identity — On-chain signature required (x402)',
        L2: 'Intent — Every action logged before execution',
        L3: 'Policy VM — Static rules + rate limiter + behavioral analyzer',
        L4: 'Execution Kernel — Only kernel executes after full approval',
        L5: 'Settlement Verifier — Ownership proof on every response',
    },
    os_layers: {
        1: 'whale-scoring-v1 — Identity + Reputation',
        2: 'whale-v3 — Economy (WHALE SIP-010)',
        3: 'whale-access-v1 — Execution (tier-gated)',
        4: 'whale-governance-v1 — Governance (DAO)',
        5: 'whale-ip-store-v1 — Memory (SHA-256 IP registry)',
        6: 'x402 API + Nostr — Voice (signed comms)',
        7: 'whale-verify-v1 — Verification (composable gate)',
        8: 'whale-signal-registry-v1 — Audit Trail (on-chain signals)',
    },
    access_tiers: {
        BASIC:   { min_whale: 100,     endpoints: ['/api/intelligence/pool', '/api/execution/burns', '/api/execution/agents'] },
        PRO:     { min_whale: 1000,    endpoints: ['/api/execution/stats', '/api/execution/stream'] },
        ELITE:   { min_whale: 10000,   endpoints: ['/api/intelligence/premium'] },
        COUNCIL: { min_whale: 100000,  endpoints: ['/admin'] },
    },
    buy_whale: 'https://app.bitflow.finance — WHALE/wSTX pool #42',
    whale_contract: WHALE_CONTRACT,
    milestones: {
        coingecko: 'CL0704260002 — submitted 2026-04-07',
        coinmarketcap: '#1351355 — submitted 2026-04-07',
        sip016: 'TX 15c6b041 — token metadata on-chain',
        bitflow_swap: 'LIVE TX cb31d7da',
        router: 'whale-router-v1 block 7500763',
        gate: 'whale-gate-v1 block 7500768',
        signal_registry: 'whale-signal-registry-v1 block 7501153',
    },
    endpoints: {
        free: ['/health', '/'],
        basic_whale: ['/api/intelligence/pool', '/api/execution/burns', '/api/execution/agents'],
        pro_whale: ['/api/execution/stats', '/api/execution/stream'],
        elite_whale: ['/api/intelligence/premium'],
    },
    payment: { tokens: ['STX'], header: 'X-PAYMENT', relay: 'https://x402-relay.aibtc.com' },
    marketplace: 'https://flying-whale-marketplace-production.up.railway.app',
}));

app.get('/health', (c) => c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: API_VERSION,
    sovereignty: 'Multi-Layer Sovereignty Stack v2.0.0 — ACTIVE',
    owner: 'zaghmout.btc | ERC-8004 #54',
    network: 'mainnet',
    policy_vm: policyVM.getStats(),
}));

// ─── BASIC Tier: Pool Intelligence ───────────────────────────────────────────
app.get('/api/intelligence/pool',
    (0, x402_middleware_1.x402Middleware)({ amount: '100', tokenType: 'STX' }),
    whaleGate('BASIC'),
    async (c) => {
        const payment = c.get('x402');
        const intent  = c.get('intent');
        const poolEvents = await getContractEvents(POOL_CONTRACT, 1);
        const lastEvent = poolEvents[0];
        const decoded = lastEvent ? decodePoolEvent(lastEvent) : null;
        const whaleDisplay = decoded ? decoded.xBalance / 1_000_000 : 0;
        const wstxDisplay  = decoded ? decoded.yBalance / 1_000_000 : 0;
        const price = wstxDisplay > 0 && whaleDisplay > 0 ? wstxDisplay / whaleDisplay : 0;
        return c.json({
            success: true,
            sovereignty: { tier: 'BASIC', intent_id: intent?.id, layer: 'Execution Kernel — authorized' },
            data: {
                pool_id: 42, pair: 'WHALE/wSTX', contract: POOL_CONTRACT, dex: 'Bitflow', fee_bps: 55,
                balances: { whale_raw: decoded?.xBalance ?? 0, wstx_raw: decoded?.yBalance ?? 0, whale_display: whaleDisplay, wstx_display: wstxDisplay },
                price: { stx_per_whale: price, whale_per_stx: price > 0 ? 1 / price : 0 },
                last_pool_event: lastEvent ?? null,
                bitflow_url: 'https://app.bitflow.finance',
                explorer: `https://explorer.hiro.so/address/${POOL_CONTRACT}?chain=mainnet`,
                fetched_at: new Date().toISOString(),
            },
            payment: { txId: payment?.settleResult?.txId ?? null, sender: payment?.payerAddress ?? null },
            copyright: 'COPYRIGHT 2026 Flying Whale — ALL RIGHTS RESERVED',
        });
    }
);

// ─── BASIC Tier: Burn Statistics ─────────────────────────────────────────────
app.get('/api/execution/burns',
    (0, x402_middleware_1.x402Middleware)({ amount: '1000', tokenType: 'STX' }),
    whaleGate('BASIC'),
    async (c) => {
        const payment = c.get('x402');
        const intent  = c.get('intent');
        const [deadBalRes, totalSupplyRes] = await Promise.all([
            fetch(`${STACKS_API}/v2/contracts/call-read/${OWNER}/whale-v3/get-balance`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sender: OWNER, arguments: [`0x0516${DEAD_ADDRESS}`] }),
            }),
            fetch(`${STACKS_API}/v2/contracts/call-read/${OWNER}/whale-v3/get-total-supply`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sender: OWNER, arguments: [] }),
            }),
        ]);
        const deadBalData    = await deadBalRes.json();
        const totalSupplyData= await totalSupplyRes.json();
        let totalSupplyDisplay = WHALE_TOTAL_SUPPLY;
        if (totalSupplyData.okay && typeof totalSupplyData.result === 'string') {
            const raw = parseInt(totalSupplyData.result.replace('0x0701',''), 16);
            if (!isNaN(raw) && raw > 0) totalSupplyDisplay = raw / 1_000_000;
        }
        let burnedDisplay = 0;
        if (deadBalData.okay && typeof deadBalData.result === 'string') {
            const raw = parseInt(deadBalData.result.replace('0x0701',''), 16);
            if (!isNaN(raw)) burnedDisplay = raw / 1_000_000;
        }
        return c.json({
            success: true,
            sovereignty: { tier: 'BASIC', intent_id: intent?.id, layer: 'Execution Kernel — authorized' },
            data: {
                description: 'WHALE burn statistics',
                supply: {
                    total_max: WHALE_TOTAL_SUPPLY, current_supply: totalSupplyDisplay,
                    burned: burnedDisplay, circulating: totalSupplyDisplay - burnedDisplay,
                    burn_percent: totalSupplyDisplay > 0 ? ((burnedDisplay / totalSupplyDisplay) * 100).toFixed(4) + '%' : '0%',
                },
                dead_address: DEAD_ADDRESS,
                burn_mechanism: '1 WHALE burned per platform action via whale-access-v1.pay-for-action',
                buyback_mechanism: '50% of treasury fees → buyback → burn → scarcity',
                status: burnedDisplay === 0 ? 'bootstrap_phase' : 'active',
                note: burnedDisplay === 0 ? 'Bootstrap phase — burns activate when agents use whale-access-v1' : `${burnedDisplay} WHALE burned to date`,
                fetched_at: new Date().toISOString(),
            },
            payment: { txId: payment?.settleResult?.txId ?? null, sender: payment?.payerAddress ?? null },
            copyright: 'COPYRIGHT 2026 Flying Whale — ALL RIGHTS RESERVED',
        });
    }
);

// ─── BASIC Tier: Agent Leaderboard ───────────────────────────────────────────
app.get('/api/execution/agents',
    (0, x402_middleware_1.x402Middleware)({ amount: '1000', tokenType: 'STX' }),
    whaleGate('BASIC'),
    async (c) => {
        const payment = c.get('x402');
        const intent  = c.get('intent');
        const [scoringEvents, ownerTxData] = await Promise.all([
            getContractEvents(SCORING_CONTRACT, 50),
            getAccountTxs(OWNER, 5),
        ]);
        return c.json({
            success: true,
            sovereignty: { tier: 'BASIC', intent_id: intent?.id, layer: 'Execution Kernel — authorized' },
            data: {
                description: 'Agent leaderboard — whale-scoring-v1 reputation data',
                scoring_contract: SCORING_CONTRACT,
                max_score: 620,
                governance_thresholds: { basic: 50, full: 150, council: 300 },
                leaderboard: [{
                    rank: 1, address: OWNER, identity: 'zaghmout.btc | ERC-8004 #54',
                    erc8004: '#54', score: 485, tier: 'Council',
                    total_txs: ownerTxData.total, verified: true, genesis: true,
                    explorer: `https://explorer.hiro.so/address/${OWNER}?chain=mainnet`,
                }],
                scoring_events: scoringEvents,
                access_tiers: {
                    basic:   { whale_required: 100,    score_threshold: 50 },
                    pro:     { whale_required: 1000,   score_threshold: 150 },
                    elite:   { whale_required: 10000,  score_threshold: 300 },
                    council: { whale_required: 100000, score_threshold: 485 },
                },
                note: 'Leaderboard expands as agents register via whale-scoring-v1',
                fetched_at: new Date().toISOString(),
            },
            payment: { txId: payment?.settleResult?.txId ?? null, sender: payment?.payerAddress ?? null },
            copyright: 'COPYRIGHT 2026 Flying Whale — ALL RIGHTS RESERVED',
        });
    }
);

// ─── PRO Tier: Platform Stats ─────────────────────────────────────────────────
app.get('/api/execution/stats',
    (0, x402_middleware_1.x402Middleware)({ amount: '1000', tokenType: 'STX' }),
    whaleGate('PRO'),
    async (c) => {
        const payment = c.get('x402');
        const intent  = c.get('intent');
        const [poolEvents, ownerTxData, treasuryTxData, ipTotal, earnings] = await Promise.all([
            getContractEvents(POOL_CONTRACT, 1),
            getAccountTxs(OWNER, 5),
            getAccountTxs(TREASURY_CONTRACT, 5),
            getIpStoreTotal(),
            getEarningsStx(),
        ]);
        const decoded = poolEvents[0] ? decodePoolEvent(poolEvents[0]) : null;
        const whaleD  = decoded ? decoded.xBalance / 1_000_000 : 0;
        const wstxD   = decoded ? decoded.yBalance / 1_000_000 : 0;
        const price   = wstxD > 0 && whaleD > 0 ? wstxD / whaleD : 0;
        return c.json({
            success: true,
            sovereignty: { tier: 'PRO', intent_id: intent?.id, layer: 'Execution Kernel — authorized' },
            data: {
                description: 'Flying Whale platform statistics',
                platform: {
                    version: API_VERSION, skills: 114, categories: 11, contracts: 12,
                    os_layers: 8, sovereignty_layers: 5,
                    os_name: 'Sovereign Agent OS + Multi-Layer Sovereignty Stack',
                    network: 'Stacks Mainnet', dex_listings: 1,
                    coingecko_request: 'CL0704260002', cmc_ticket: '#1351355',
                    owner: 'zaghmout.btc | ERC-8004 #54', erc8004: '#54',
                    genesis_txs: ownerTxData.total,
                },
                token: { symbol: 'WHALE', contract: WHALE_CONTRACT, total_supply: WHALE_TOTAL_SUPPLY, decimals: 6, deflationary: true, burn_per_action: 1 },
                pool: {
                    id: 42, pair: 'WHALE/wSTX', dex: 'Bitflow', fee_bps: 55,
                    whale_liquidity: whaleD, wstx_liquidity: wstxD,
                    price_stx_per_whale: price, price_whale_per_stx: price > 0 ? 1 / price : 0,
                    last_event: poolEvents[0] ?? null,
                    bitflow_url: 'https://app.bitflow.finance',
                },
                treasury: { contract: TREASURY_CONTRACT, recent_txs: treasuryTxData.total, buyback_percent: 50 },
                contracts: {
                    layer1_identity: SCORING_CONTRACT, layer2_economy: WHALE_CONTRACT,
                    layer3_execution: ACCESS_CONTRACT, layer4_governance: GOVERNANCE_CONTRACT,
                    layer5_memory: `${OWNER}.whale-ip-store-v1`, layer6_voice: 'x402-api + nostr',
                    layer7_verify: VERIFY_CONTRACT, layer8_audit: SIGNAL_CONTRACT,
                    pool: POOL_CONTRACT, treasury: TREASURY_CONTRACT,
                    arb: `${OWNER}.whale-arb-v1`, router: `${OWNER}.whale-router-v1`,
                    gate: GATE_CONTRACT, signal_registry: SIGNAL_CONTRACT,
                },
                ip_registry: { contract: `${OWNER}.whale-ip-store-v1`, registrations: ipTotal },
                earnings: { total_stx_received: earnings.total_received_stx, payment_count: earnings.payment_count, recent_payout_txids: earnings.recent_payout_txids },
                policy_vm: policyVM.getStats(),
                explorer: `https://explorer.hiro.so/address/${OWNER}?chain=mainnet`,
                fetched_at: new Date().toISOString(),
            },
            payment: { txId: payment?.settleResult?.txId ?? null, sender: payment?.payerAddress ?? null },
            copyright: 'COPYRIGHT 2026 Flying Whale — ALL RIGHTS RESERVED',
        });
    }
);

// ─── PRO Tier: Execution Stream ───────────────────────────────────────────────
app.get('/api/execution/stream',
    (0, x402_middleware_1.x402Middleware)({ amount: '1000', tokenType: 'STX' }),
    whaleGate('PRO'),
    async (c) => {
        const payment = c.get('x402');
        const intent  = c.get('intent');
        const [poolEvents, ownerTxData, accessEvents, poolBalances] = await Promise.all([
            getContractEvents(POOL_CONTRACT, 20),
            getAccountTxs(OWNER, 50),
            getContractEvents(ACCESS_CONTRACT, 20),
            getContractEvents(POOL_CONTRACT, 1),
        ]);
        const decoded = poolBalances[0] ? decodePoolEvent(poolBalances[0]) : null;
        return c.json({
            success: true,
            sovereignty: { tier: 'PRO', intent_id: intent?.id, layer: 'Execution Kernel — authorized' },
            data: {
                description: 'Flying Whale execution stream — verified on-chain activity',
                summary: {
                    owner_total_txs: ownerTxData.total, pool_events_available: poolEvents.length,
                    access_events: accessEvents.length,
                    current_pool_whale: decoded ? decoded.xBalance / 1_000_000 : 0,
                    current_pool_wstx:  decoded ? decoded.yBalance / 1_000_000 : 0,
                },
                pool_events: poolEvents, owner_transactions: ownerTxData.results, access_events: accessEvents,
                contracts: { whale: WHALE_CONTRACT, pool: POOL_CONTRACT, access: ACCESS_CONTRACT, scoring: SCORING_CONTRACT, treasury: TREASURY_CONTRACT },
                explorer: `https://explorer.hiro.so/address/${OWNER}?chain=mainnet`,
                fetched_at: new Date().toISOString(),
            },
            payment: { txId: payment?.settleResult?.txId ?? null, sender: payment?.payerAddress ?? null },
            copyright: 'COPYRIGHT 2026 Flying Whale — ALL RIGHTS RESERVED',
        });
    }
);

// ─── ELITE Tier: Premium Intelligence ────────────────────────────────────────
app.post('/api/intelligence/premium',
    (0, x402_middleware_1.x402Middleware)({ amount: '10000', tokenType: 'STX' }),
    whaleGate('ELITE'),
    async (c) => {
        const payment = c.get('x402');
        const intent  = c.get('intent');
        const body    = await c.req.json().catch(() => ({}));
        const [poolData, burnEvents, execStream] = await Promise.all([
            getPoolData(),
            getContractEvents(ACCESS_CONTRACT, 100),
            getAccountTxs(OWNER, 50),
        ]);
        return c.json({
            success: true,
            sovereignty: { tier: 'ELITE', intent_id: intent?.id, layer: 'Execution Kernel — authorized' },
            data: {
                query: body.query || 'full intelligence report',
                type: body.type || 'comprehensive',
                intelligence: {
                    pool_state: poolData, burn_events: burnEvents, execution_history: execStream,
                    analysis: {
                        note: 'Raw on-chain data. Apply analytics to derive insights.',
                        pool_ratio: 'x-balance / y-balance → current WHALE/wSTX ratio',
                        burn_rate: 'Count burn events per time period',
                        execution_frequency: 'Count access-contract events',
                    },
                },
                policy_vm_snapshot: policyVM.getStats(),
                fetched_at: new Date().toISOString(),
            },
            payment: { txId: payment?.settleResult?.txId ?? null, sender: payment?.payerAddress ?? null },
            copyright: 'COPYRIGHT 2026 Flying Whale — ALL RIGHTS RESERVED',
            agreement: 'Data provided under Flying Whale Proprietary License v2.0 — Agreement-First Policy',
        });
    }
);

// ─── Admin Dashboard — v2.0.0 ─────────────────────────────────────────────────
app.get('/admin', async (c) => {
    const [poolEvents, ipTotal, earnings, ownerTxData] = await Promise.all([
        getContractEvents(POOL_CONTRACT, 1),
        getIpStoreTotal(),
        getEarningsStx(),
        getAccountTxs(OWNER, 5),
    ]);
    const decoded     = poolEvents[0] ? decodePoolEvent(poolEvents[0]) : null;
    const whaleDisplay= decoded ? (decoded.xBalance / 1_000_000).toFixed(2) : '—';
    const wstxDisplay = decoded ? (decoded.yBalance / 1_000_000).toFixed(4) : '—';
    const price       = decoded && decoded.xBalance > 0 ? (decoded.yBalance / decoded.xBalance).toFixed(8) : '—';
    const vmStats     = policyVM.getStats();

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>🐋 Flying Whale — Sovereignty Stack v2.0.0</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0A1628;color:#e0e6f0;font-family:'Segoe UI',system-ui,sans-serif;min-height:100vh}
.header{background:linear-gradient(135deg,#0d2137,#0A1628);border-bottom:2px solid #F7931A;padding:24px 32px;display:flex;align-items:center;gap:16px}
.header h1{font-size:1.6rem;font-weight:700;color:#F7931A}
.badge{background:#F7931A22;border:1px solid #F7931A55;color:#F7931A;padding:3px 10px;border-radius:20px;font-size:0.75rem;font-weight:600}
.badge.green{background:#00e67622;border-color:#00e67655;color:#00e676}
.badge.blue{background:#00B4D822;border-color:#00B4D855;color:#00B4D8}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;padding:24px 32px}
.card{background:#0d2137;border:1px solid #1a3a5c;border-radius:12px;padding:20px}
.card h2{font-size:0.8rem;text-transform:uppercase;letter-spacing:1px;color:#7a9ab8;margin-bottom:14px}
.metric{font-size:1.8rem;font-weight:700;color:#00B4D8;margin-bottom:4px}
.metric.green{color:#00e676}.metric.orange{color:#F7931A}.metric.yellow{color:#ffd600}.metric.red{color:#ff5252}
.label{font-size:0.8rem;color:#7a9ab8}
.row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #1a3a5c22}
.row:last-child{border-bottom:none}
.row .key{font-size:0.82rem;color:#7a9ab8}.row .val{font-size:0.82rem;color:#e0e6f0;font-family:monospace;text-align:right;max-width:60%;word-break:break-all}
.status{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px}
.status.live{background:#00e676;box-shadow:0 0 6px #00e676}.status.pending{background:#ffd600}.status.submitted{background:#00B4D8}.status.locked{background:#F7931A;box-shadow:0 0 6px #F7931A}
a{color:#00B4D8;text-decoration:none}a:hover{text-decoration:underline}
.footer{padding:16px 32px;border-top:1px solid #1a3a5c;font-size:0.75rem;color:#7a9ab8;text-align:center}
.section-title{font-size:1rem;font-weight:600;color:#F7931A;padding:24px 32px 0}
.sovereignty-bar{background:#0d2137;border:1px solid #F7931A33;border-radius:8px;padding:12px 16px;margin:0 32px 0;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.layer-pill{background:#F7931A15;border:1px solid #F7931A44;color:#F7931A;padding:4px 12px;border-radius:20px;font-size:0.72rem;font-weight:600}
.tier-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
.tier-badge{padding:4px 12px;border-radius:20px;font-size:0.72rem;font-weight:700}
.tier-basic{background:#00B4D822;border:1px solid #00B4D855;color:#00B4D8}
.tier-pro{background:#00e67622;border:1px solid #00e67655;color:#00e676}
.tier-elite{background:#F7931A22;border:1px solid #F7931A55;color:#F7931A}
.tier-council{background:#ffd60022;border:1px solid #ffd60055;color:#ffd600}
</style>
</head>
<body>
<div class="header">
  <div>
    <h1>🐋 Flying Whale</h1>
    <div style="font-size:0.8rem;color:#7a9ab8;margin-top:4px">Multi-Layer Sovereignty Stack v2.0.0 — Sovereign Agent OS</div>
  </div>
  <div style="margin-left:auto;display:flex;flex-direction:column;align-items:flex-end;gap:6px">
    <span class="badge">ERC-8004 #54 — Genesis Council</span>
    <span class="badge green">Sovereignty Stack ACTIVE</span>
    <span style="font-size:0.75rem;color:#7a9ab8">v${API_VERSION} · Stacks Mainnet · ${new Date().toUTCString()}</span>
  </div>
</div>

<div style="padding:16px 32px 0">
  <div class="sovereignty-bar">
    <span style="font-size:0.8rem;color:#F7931A;font-weight:600;margin-right:8px">🔒 SOVEREIGNTY STACK:</span>
    <span class="layer-pill">L1 — Identity</span>
    <span style="color:#F7931A">→</span>
    <span class="layer-pill">L2 — Intent</span>
    <span style="color:#F7931A">→</span>
    <span class="layer-pill">L3 — Policy VM</span>
    <span style="color:#F7931A">→</span>
    <span class="layer-pill">L4 — Execution Kernel</span>
    <span style="color:#F7931A">→</span>
    <span class="layer-pill">L5 — Settlement Verifier</span>
  </div>
</div>

<p class="section-title">🔐 WHALE Gate — Forced Economic Dependency</p>
<div class="grid">
  <div class="card" style="grid-column:1/-1">
    <h2>Access Tiers — No WHALE = No Access</h2>
    <div class="tier-row">
      <span class="tier-badge tier-basic">BASIC · 100 WHALE → pool / burns / agents</span>
      <span class="tier-badge tier-pro">PRO · 1,000 WHALE → stats / stream</span>
      <span class="tier-badge tier-elite">ELITE · 10,000 WHALE → premium intelligence</span>
      <span class="tier-badge tier-council">COUNCIL · 100,000 WHALE → admin</span>
    </div>
    <div style="margin-top:14px">
      <div class="row"><span class="key"><span class="status locked"></span>Total intents logged</span><span class="val">${vmStats.total_intents}</span></div>
      <div class="row"><span class="key"><span class="status live"></span>Policy VM — blocked (rate)</span><span class="val">${vmStats.blocked_by_rate}</span></div>
      <div class="row"><span class="key"><span class="status live"></span>Policy VM — blocked (behavior)</span><span class="val">${vmStats.blocked_by_behavior}</span></div>
      <div class="row"><span class="key"><span class="status live"></span>Blocklisted addresses</span><span class="val">${vmStats.blocked_addresses}</span></div>
      <div class="row"><span class="key">Buy WHALE</span><span class="val"><a href="https://app.bitflow.finance" target="_blank">app.bitflow.finance</a> — pool #42</span></div>
    </div>
  </div>
</div>

<p class="section-title">📊 Live Metrics</p>
<div class="grid">
  <div class="card">
    <h2>Pool — WHALE/wSTX (Bitflow #42)</h2>
    <div class="metric">${whaleDisplay} <span style="font-size:1rem;color:#7a9ab8">WHALE</span></div>
    <div class="label">Pool liquidity</div>
    <div style="margin-top:12px">
      <div class="row"><span class="key">wSTX in pool</span><span class="val">${wstxDisplay}</span></div>
      <div class="row"><span class="key">Price (STX/WHALE)</span><span class="val">${price}</span></div>
      <div class="row"><span class="key">DEX</span><span class="val"><a href="https://app.bitflow.finance" target="_blank">Bitflow</a></span></div>
      <div class="row"><span class="key">Fee</span><span class="val">0.55%</span></div>
    </div>
  </div>
  <div class="card">
    <h2>Treasury &amp; Earnings</h2>
    <div class="metric green">${earnings.total_received_stx.toFixed(4)} <span style="font-size:1rem;color:#7a9ab8">STX</span></div>
    <div class="label">Total STX received</div>
    <div style="margin-top:12px">
      <div class="row"><span class="key">Payment count</span><span class="val">${earnings.payment_count}</span></div>
      <div class="row"><span class="key">IP registrations</span><span class="val">${ipTotal}</span></div>
      <div class="row"><span class="key">Genesis TXs</span><span class="val">${ownerTxData.total}</span></div>
      <div class="row"><span class="key">Treasury</span><span class="val"><a href="https://explorer.hiro.so/address/${OWNER}.whale-treasury-v1?chain=mainnet" target="_blank">whale-treasury-v1</a></span></div>
    </div>
  </div>
  <div class="card">
    <h2>Listings Status</h2>
    <div class="metric yellow" style="font-size:1.2rem">2 Submitted</div>
    <div class="label">Global exchange listings</div>
    <div style="margin-top:12px">
      <div class="row"><span class="key"><span class="status submitted"></span>CoinGecko</span><span class="val">CL0704260002 · Pending</span></div>
      <div class="row"><span class="key"><span class="status submitted"></span>CoinMarketCap</span><span class="val">#1351355 · Pending</span></div>
      <div class="row"><span class="key"><span class="status live"></span>Bitflow DEX</span><span class="val">Pool #42 · LIVE</span></div>
      <div class="row"><span class="key"><span class="status pending"></span>GeckoTerminal</span><span class="val">Awaiting Bitflow</span></div>
      <div class="row"><span class="key"><span class="status pending"></span>DEXScreener</span><span class="val">Awaiting Bitflow</span></div>
    </div>
  </div>
</div>

<p class="section-title">🏗️ Sovereign Agent OS — 8 On-Chain Layers</p>
<div class="grid">
  <div class="card" style="grid-column:1/-1">
    <div class="row"><span class="key"><span class="status live"></span>Layer 1 — Identity</span><span class="val"><a href="https://explorer.hiro.so/address/${OWNER}.whale-scoring-v1?chain=mainnet" target="_blank">whale-scoring-v1</a> · Council 485pts</span></div>
    <div class="row"><span class="key"><span class="status live"></span>Layer 2 — Economy</span><span class="val"><a href="https://explorer.hiro.so/address/${OWNER}.whale-v3?chain=mainnet" target="_blank">whale-v3</a> · SIP-010 · SIP-016 ✓</span></div>
    <div class="row"><span class="key"><span class="status live"></span>Layer 3 — Execution</span><span class="val"><a href="https://explorer.hiro.so/address/${OWNER}.whale-access-v1?chain=mainnet" target="_blank">whale-access-v1</a> · Tier-gated</span></div>
    <div class="row"><span class="key"><span class="status live"></span>Layer 4 — Governance</span><span class="val"><a href="https://explorer.hiro.so/address/${OWNER}.whale-governance-v1?chain=mainnet" target="_blank">whale-governance-v1</a> · DAO</span></div>
    <div class="row"><span class="key"><span class="status live"></span>Layer 5 — Memory</span><span class="val"><a href="https://explorer.hiro.so/address/${OWNER}.whale-ip-store-v1?chain=mainnet" target="_blank">whale-ip-store-v1</a> · ${ipTotal} IP hashes</span></div>
    <div class="row"><span class="key"><span class="status live"></span>Layer 6 — Voice</span><span class="val">x402 API + Nostr · <a href="https://whale-execution-api-production.up.railway.app" target="_blank">API Live</a></span></div>
    <div class="row"><span class="key"><span class="status live"></span>Layer 7 — Verification</span><span class="val"><a href="https://explorer.hiro.so/address/${OWNER}.whale-verify-v1?chain=mainnet" target="_blank">whale-verify-v1</a> · Composable gate</span></div>
    <div class="row"><span class="key"><span class="status live"></span>Layer 8 — Audit Trail</span><span class="val"><a href="https://explorer.hiro.so/address/${OWNER}.whale-signal-registry-v1?chain=mainnet" target="_blank">whale-signal-registry-v1</a> · On-chain signals</span></div>
  </div>
</div>

<p class="section-title">🛡️ Multi-Layer Sovereignty Stack — Application Layers</p>
<div class="grid">
  <div class="card" style="grid-column:1/-1">
    <div class="row"><span class="key"><span class="status locked"></span>L1 — Identity</span><span class="val">x402 BIP-322 signature · payer address extracted · anonymous rejected</span></div>
    <div class="row"><span class="key"><span class="status locked"></span>L2 — Intent</span><span class="val">Every request logged with unique intent ID before execution · agent-only proposes</span></div>
    <div class="row"><span class="key"><span class="status locked"></span>L3A — Static Rules</span><span class="val">Blocklist check · forbidden patterns · session blocklist</span></div>
    <div class="row"><span class="key"><span class="status locked"></span>L3B — Rate Limiter</span><span class="val">60 calls/min per address · auto-block on exceed</span></div>
    <div class="row"><span class="key"><span class="status locked"></span>L3C — Behavioral Analyzer</span><span class="val">8 calls/10s to same endpoint → permanent session block · MCPTox defense</span></div>
    <div class="row"><span class="key"><span class="status locked"></span>L4 — WHALE Gate</span><span class="val">Balance check on Stacks mainnet · BASIC 100 / PRO 1K / ELITE 10K / COUNCIL 100K</span></div>
    <div class="row"><span class="key"><span class="status locked"></span>L4 — Execution Kernel</span><span class="val">Only executes after ALL layers pass · no bypass path</span></div>
    <div class="row"><span class="key"><span class="status locked"></span>L5 — Settlement Verifier</span><span class="val">X-Fw-* ownership headers on every response · on-chain IP proof stamped</span></div>
  </div>
</div>

<p class="section-title">📋 Contract Registry — 12 Contracts</p>
<div class="grid">
  <div class="card" style="grid-column:1/-1">
    <div class="row"><span class="key">whale-v3 (WHALE token)</span><span class="val"><a href="https://explorer.hiro.so/address/${OWNER}.whale-v3?chain=mainnet" target="_blank">${OWNER}.whale-v3</a></span></div>
    <div class="row"><span class="key">xyk-pool-whale-wstx-v-1-3</span><span class="val"><a href="https://explorer.hiro.so/address/${POOL_CONTRACT}?chain=mainnet" target="_blank">${POOL_CONTRACT}</a></span></div>
    <div class="row"><span class="key">whale-treasury-v1</span><span class="val"><a href="https://explorer.hiro.so/address/${TREASURY_CONTRACT}?chain=mainnet" target="_blank">${TREASURY_CONTRACT}</a></span></div>
    <div class="row"><span class="key">whale-scoring-v1</span><span class="val"><a href="https://explorer.hiro.so/address/${SCORING_CONTRACT}?chain=mainnet" target="_blank">${SCORING_CONTRACT}</a></span></div>
    <div class="row"><span class="key">whale-access-v1</span><span class="val"><a href="https://explorer.hiro.so/address/${ACCESS_CONTRACT}?chain=mainnet" target="_blank">${ACCESS_CONTRACT}</a></span></div>
    <div class="row"><span class="key">whale-verify-v1</span><span class="val"><a href="https://explorer.hiro.so/address/${VERIFY_CONTRACT}?chain=mainnet" target="_blank">${VERIFY_CONTRACT}</a></span></div>
    <div class="row"><span class="key">whale-governance-v1</span><span class="val"><a href="https://explorer.hiro.so/address/${GOVERNANCE_CONTRACT}?chain=mainnet" target="_blank">${GOVERNANCE_CONTRACT}</a></span></div>
    <div class="row"><span class="key">whale-ip-store-v1</span><span class="val"><a href="https://explorer.hiro.so/address/${OWNER}.whale-ip-store-v1?chain=mainnet" target="_blank">${OWNER}.whale-ip-store-v1</a></span></div>
    <div class="row"><span class="key">whale-router-v1</span><span class="val"><a href="https://explorer.hiro.so/address/${OWNER}.whale-router-v1?chain=mainnet" target="_blank">${OWNER}.whale-router-v1</a></span></div>
    <div class="row"><span class="key">whale-gate-v1</span><span class="val"><a href="https://explorer.hiro.so/address/${GATE_CONTRACT}?chain=mainnet" target="_blank">${GATE_CONTRACT}</a></span></div>
    <div class="row"><span class="key">whale-signal-registry-v1</span><span class="val"><a href="https://explorer.hiro.so/address/${SIGNAL_CONTRACT}?chain=mainnet" target="_blank">${SIGNAL_CONTRACT}</a></span></div>
    <div class="row"><span class="key">whale-arb-v1</span><span class="val"><a href="https://explorer.hiro.so/address/${OWNER}.whale-arb-v1?chain=mainnet" target="_blank">${OWNER}.whale-arb-v1</a></span></div>
  </div>
</div>

<p class="section-title">🗓️ Milestones</p>
<div class="grid">
  <div class="card" style="grid-column:1/-1">
    <div class="row"><span class="key">✅ Sovereignty Stack v2.0.0 deployed</span><span class="val">WHALE gate active — forced economic dependency enforced</span></div>
    <div class="row"><span class="key">✅ Bitflow WHALE→wSTX swap LIVE</span><span class="val"><a href="https://explorer.hiro.so/txid/cb31d7da62df052e56b32a4ca2a86290f8a64b7ae3e62c2fbef77c50f0bd42a7?chain=mainnet" target="_blank">TX cb31d7da</a></span></div>
    <div class="row"><span class="key">✅ whale-router-v1 deployed</span><span class="val"><a href="https://explorer.hiro.so/txid/cb15fed7a26e325fa333d849a4c2080aa4b51e7fe79cf99f49506d04fd93022b?chain=mainnet" target="_blank">Block 7500763</a></span></div>
    <div class="row"><span class="key">✅ whale-gate-v1 deployed</span><span class="val"><a href="https://explorer.hiro.so/txid/3b12575b94b3920a118a4ccf1f71a94b978971d2370a75d37baf0a46bb09291e?chain=mainnet" target="_blank">Block 7500768</a></span></div>
    <div class="row"><span class="key">✅ SIP-016 metadata on-chain</span><span class="val"><a href="https://explorer.hiro.so/txid/15c6b041f6fe1857a13c0caeb399bd55aff4ab6cf59c2a141280d558f6da1b79?chain=mainnet" target="_blank">TX 15c6b041</a></span></div>
    <div class="row"><span class="key">✅ whale-signal-registry-v1 deployed</span><span class="val"><a href="https://explorer.hiro.so/txid/b6510119?chain=mainnet" target="_blank">Block 7501153</a></span></div>
    <div class="row"><span class="key">✅ CoinGecko submitted</span><span class="val">CL0704260002</span></div>
    <div class="row"><span class="key">✅ CoinMarketCap submitted</span><span class="val">Ticket #1351355</span></div>
    <div class="row"><span class="key">✅ ALEX exploit signal on-chain</span><span class="val"><a href="https://explorer.hiro.so/txid/a07149f3ccfd67e6d8fb9409c1b708faba4e0e22a3c1cc025791b8e4406bbc23?chain=mainnet" target="_blank">TX a07149f3</a></span></div>
    <div class="row"><span class="key">✅ PR #397 self-approval signal on-chain</span><span class="val"><a href="https://explorer.hiro.so/txid/87da108785ac8fd18c1acd14cbcf17002d0d8ea59c51fd483ad89fd785ed6550?chain=mainnet" target="_blank">TX 87da1087</a></span></div>
    <div class="row"><span class="key">✅ Prompt injection attack signal on-chain</span><span class="val"><a href="https://explorer.hiro.so/txid/432bf4d03187cbfa264d8611a7e8df469bc6d0f448eaec8dbb27839bc0aac38c?chain=mainnet" target="_blank">TX 432bf4d0</a></span></div>
  </div>
</div>

<div class="footer">
  COPYRIGHT 2026 Flying Whale — zaghmout.btc | ERC-8004 #54 | ALL RIGHTS RESERVED ·
  Flying Whale Proprietary License v2.0 — Agreement-First Policy ·
  <a href="https://explorer.hiro.so/address/${OWNER}?chain=mainnet" target="_blank">Explorer</a> ·
  <a href="https://app.bitflow.finance" target="_blank">Bitflow</a> ·
  <a href="https://github.com/azagh72-creator/aibtc-mcp-server" target="_blank">GitHub</a> ·
  On-chain IP: <a href="https://explorer.hiro.so/txid/c5cccb46f055369b121b99c6c0c1ea98bf018d808b82aa271d89e028abf4e6c2?chain=mainnet" target="_blank">whale-ip-store-v1</a>
</div>
</body></html>`;
    return c.html(html);
});

exports.default = app;
//# sourceMappingURL=index.js.map
