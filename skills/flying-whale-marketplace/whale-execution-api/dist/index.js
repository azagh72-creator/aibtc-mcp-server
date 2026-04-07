"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// BigInt.toJSON polyfill for JSON.stringify compatibility
BigInt.prototype.toJSON = function () {
    return this.toString();
};
// COPYRIGHT 2026 Flying Whale - zaghmout.btc | ERC-8004 #54
// ALL RIGHTS RESERVED — Flying Whale Proprietary License v2.0
// Execution Layer API — x402 paid endpoints
const hono_1 = require("hono");
const cors_1 = require("hono/cors");
const x402_middleware_1 = require("./x402-middleware");
// ─── Constants ────────────────────────────────────────────────────────────────
const STACKS_API = 'https://api.hiro.so';
const OWNER = 'SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW';
const WHALE_CONTRACT = `${OWNER}.whale-v3`;
const POOL_CONTRACT = `${OWNER}.xyk-pool-whale-wstx-v-1-3`;
const TREASURY_CONTRACT = `${OWNER}.whale-treasury-v1`;
const SCORING_CONTRACT = `${OWNER}.whale-scoring-v1`;
const ACCESS_CONTRACT = `${OWNER}.whale-access-v1`;
const VERIFY_CONTRACT = `${OWNER}.whale-verify-v1`;
const GOVERNANCE_CONTRACT = `${OWNER}.whale-governance-v1`;
const DEAD_ADDRESS = 'SP000000000000000000002Q6VF78';
const WHALE_TOTAL_SUPPLY = 12_616_800;
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
async function getTokenBalance(contract, address) {
    const [addr, name] = contract.split('.');
    const res = await fetch(`${STACKS_API}/v2/contracts/call-read/${addr}/${name}/get-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: address, arguments: [`0x0516${Buffer.from(address).toString('hex')}`] }),
    });
    const data = await res.json();
    if (data.okay && typeof data.result === 'string') {
        const hex = data.result.replace('0x0701', '');
        return parseInt(hex, 16);
    }
    return 0;
}
async function getPoolData() {
    const [addr, name] = POOL_CONTRACT.split('.');
    const res = await fetch(`${STACKS_API}/v2/contracts/call-read/${addr}/${name}/get-pool`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: OWNER, arguments: [] }),
    });
    const data = await res.json();
    return data;
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
                if (!isNaN(raw))
                    return raw;
            }
        }
    }
    catch { /* ignore */ }
    return 0;
}
async function getEarningsStx() {
    try {
        const res = await fetch(`${STACKS_API}/extended/v1/address/${OWNER}/transactions?limit=50`);
        const data = await res.json();
        const txs = data.results || [];
        const incoming = txs.filter(tx => {
            if (tx.tx_type !== 'token_transfer')
                return false;
            const tt = tx.token_transfer;
            return tt?.recipient_address === OWNER;
        });
        const total = incoming.reduce((sum, tx) => {
            const tt = tx.token_transfer;
            return sum + (parseInt(String(tt?.amount || '0')) / 1_000_000);
        }, 0);
        const txids = incoming.slice(0, 5).map(tx => String(tx.tx_id || ''));
        return { total_received_stx: total, payment_count: incoming.length, recent_payout_txids: txids };
    }
    catch { /* ignore */ }
    return { total_received_stx: 0, payment_count: 0, recent_payout_txids: [] };
}
function decodeUint(hex) {
    // Clarity uint: 0x01 prefix + 16 bytes big-endian
    const clean = hex.replace('0x', '');
    if (clean.startsWith('01') && clean.length === 34) {
        return parseInt(clean.slice(2), 16);
    }
    return 0;
}
function decodePoolEvent(event) {
    try {
        const log = event.contract_log;
        const value = log?.value;
        const repr = value?.repr;
        if (!repr)
            return null;
        // Parse (tuple (action "update-pool-balances") (data (tuple (x-balance uN) (y-balance uN))))
        const xMatch = repr.match(/x-balance\s+u(\d+)/);
        const yMatch = repr.match(/y-balance\s+u(\d+)/);
        if (!xMatch || !yMatch)
            return null;
        return { xBalance: parseInt(xMatch[1]), yBalance: parseInt(yMatch[1]) };
    }
    catch {
        return null;
    }
}
// ─── App ──────────────────────────────────────────────────────────────────────
const app = new hono_1.Hono();
app.use('*', (0, cors_1.cors)({
    origin: '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['X-PAYMENT', 'X-PAYMENT-TOKEN-TYPE', 'Authorization', 'Content-Type'],
    exposeHeaders: [
        'X-PAYMENT-RESPONSE', 'X-PAYER-ADDRESS',
        'X-Fw-Owner', 'X-Fw-Identity', 'X-Fw-Registry', 'X-Fw-License', 'X-Fw-Verify',
    ],
}));
// ─── Ownership Proof Headers ──────────────────────────────────────────────────
app.use('*', async (c, next) => {
    await next();
    c.res.headers.set('X-Fw-Owner', 'SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW');
    c.res.headers.set('X-Fw-Identity', 'Flying Whale | zaghmout.btc | ERC-8004 #54');
    c.res.headers.set('X-Fw-Registry', 'SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-ip-store-v1');
    c.res.headers.set('X-Fw-License', 'Flying Whale Proprietary License v2.0');
    c.res.headers.set('X-Fw-Verify', 'https://explorer.hiro.so/txid/c5cccb46f055369b121b99c6c0c1ea98bf018d808b82aa271d89e028abf4e6c2?chain=mainnet');
});
app.use('*', async (c, next) => {
    if (c.req.path === '/health' || c.req.path === '/')
        return next();
    if (!c.env.RECIPIENT_ADDRESS) {
        return c.json({ error: 'Server configuration error', missing: 'RECIPIENT_ADDRESS' }, 503);
    }
    await next();
});
// ─── Public Endpoints ─────────────────────────────────────────────────────────
app.get('/', (c) => c.json({
    service: 'Flying Whale Execution API',
    version: '1.3.0',
    os: 'Sovereign Agent OS — 8-Layer Bitcoin AI Infrastructure',
    owner: 'zaghmout.btc | ERC-8004 #54 | Council 485pts',
    copyright: 'COPYRIGHT 2026 Flying Whale — ALL RIGHTS RESERVED',
    layers: {
        1: 'whale-scoring-v1 — Identity + Reputation',
        2: 'whale-v3 — Economy (WHALE token, SIP-010)',
        3: 'whale-access-v1 — Execution (tier-gated)',
        4: 'whale-governance-v1 — Governance (DAO)',
        5: 'whale-ip-store-v1 — Memory (SHA-256 IP registry)',
        6: 'x402 API + Nostr — Voice (signed comms)',
        7: 'whale-verify-v1 — Verification (composable gate)',
        8: 'whale-signal-registry-v1 — Audit Trail (on-chain signals)',
    },
    milestones: {
        coingecko: 'Submitted CL0704260002 — 2026-04-07',
        coinmarketcap: 'Submitted #1351355 — 2026-04-07',
        sip016_metadata: 'TX 15c6b041 — token URI on-chain',
        bitflow_swap: 'WHALE→wSTX LIVE TX cb31d7da',
        router: 'whale-router-v1 LIVE block 7500763',
        gate: 'whale-gate-v1 LIVE block 7500768',
        signal_registry: 'whale-signal-registry-v1 LIVE block 7501153',
    },
    endpoints: {
        free: ['/health', '/api/intelligence/pool'],
        paid: ['/api/execution/stream', '/api/execution/burns', '/api/execution/agents', '/api/execution/stats', '/api/intelligence/premium'],
        admin: ['/admin'],
    },
    payment: { tokens: ['STX'], header: 'X-PAYMENT' },
    marketplace: 'https://flying-whale-marketplace-production.up.railway.app',
    verify_integration: 'SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-verify-v1',
}));
app.get('/health', (c) => c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    owner: 'zaghmout.btc',
    network: 'mainnet',
}));
// ─── Free: Pool Data ──────────────────────────────────────────────────────────
app.get('/api/intelligence/pool', (0, x402_middleware_1.x402Middleware)({ amount: '100', tokenType: 'STX' }), async (c) => {
    const payment = c.get('x402');
    const [poolEvents] = await Promise.all([
        getContractEvents(POOL_CONTRACT, 1),
    ]);
    const lastEvent = poolEvents[0];
    const decoded = lastEvent ? decodePoolEvent(lastEvent) : null;
    const whaleBalance = decoded?.xBalance ?? 0;
    const wstxBalance = decoded?.yBalance ?? 0;
    const whaleDisplay = whaleBalance / 1_000_000;
    const wstxDisplay = wstxBalance / 1_000_000;
    const priceSTXperWHALE = wstxDisplay > 0 && whaleDisplay > 0 ? wstxDisplay / whaleDisplay : 0;
    return c.json({
        success: true,
        data: {
            pool_id: 42,
            pair: 'WHALE/wSTX',
            contract: POOL_CONTRACT,
            dex: 'Bitflow',
            fee_bps: 55,
            balances: {
                whale_raw: whaleBalance,
                wstx_raw: wstxBalance,
                whale_display: whaleDisplay,
                wstx_display: wstxDisplay,
            },
            price: {
                stx_per_whale: priceSTXperWHALE,
                whale_per_stx: priceSTXperWHALE > 0 ? 1 / priceSTXperWHALE : 0,
            },
            last_pool_event: lastEvent ?? null,
            bitflow_url: 'https://app.bitflow.finance',
            explorer: `https://explorer.hiro.so/address/${POOL_CONTRACT}?chain=mainnet`,
            fetched_at: new Date().toISOString(),
        },
        payment: { txId: payment?.settleResult?.txId ?? null, sender: payment?.payerAddress ?? null, settle: payment?.settleResult ?? null },
        copyright: 'COPYRIGHT 2026 Flying Whale — ALL RIGHTS RESERVED',
    });
});
// ─── Paid: Execution Stream ───────────────────────────────────────────────────
app.get('/api/execution/stream', (0, x402_middleware_1.x402Middleware)({ amount: '1000', tokenType: 'STX' }), async (c) => {
    const payment = c.get('x402');
    const [poolEvents, ownerTxData, accessEvents, poolBalances] = await Promise.all([
        getContractEvents(POOL_CONTRACT, 20),
        getAccountTxs(OWNER, 50),
        getContractEvents(ACCESS_CONTRACT, 20),
        getContractEvents(POOL_CONTRACT, 1),
    ]);
    const lastPoolEvent = poolBalances[0];
    const decoded = lastPoolEvent ? decodePoolEvent(lastPoolEvent) : null;
    return c.json({
        success: true,
        data: {
            description: 'Flying Whale execution stream — verified on-chain activity',
            summary: {
                owner_total_txs: ownerTxData.total,
                pool_events_available: poolEvents.length,
                access_events: accessEvents.length,
                current_pool_whale: decoded ? decoded.xBalance / 1_000_000 : 0,
                current_pool_wstx: decoded ? decoded.yBalance / 1_000_000 : 0,
            },
            pool_events: poolEvents,
            owner_transactions: ownerTxData.results,
            access_events: accessEvents,
            contracts: {
                whale: WHALE_CONTRACT,
                pool: POOL_CONTRACT,
                access: ACCESS_CONTRACT,
                scoring: SCORING_CONTRACT,
                treasury: TREASURY_CONTRACT,
            },
            explorer: `https://explorer.hiro.so/address/${OWNER}?chain=mainnet`,
            fetched_at: new Date().toISOString(),
        },
        payment: { txId: payment?.settleResult?.txId ?? null, sender: payment?.payerAddress ?? null, settle: payment?.settleResult ?? null },
        copyright: 'COPYRIGHT 2026 Flying Whale — ALL RIGHTS RESERVED',
    });
});
// ─── Paid: Burn Statistics ────────────────────────────────────────────────────
app.get('/api/execution/burns', (0, x402_middleware_1.x402Middleware)({ amount: '1000', tokenType: 'STX' }), async (c) => {
    const payment = c.get('x402');
    // Get dead address WHALE balance = total burned
    const [deadBalRes, totalSupplyRes] = await Promise.all([
        fetch(`${STACKS_API}/v2/contracts/call-read/${OWNER}/whale-v3/get-balance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sender: OWNER, arguments: [`0x0516${DEAD_ADDRESS}`] }),
        }),
        fetch(`${STACKS_API}/v2/contracts/call-read/${OWNER}/whale-v3/get-total-supply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sender: OWNER, arguments: [] }),
        }),
    ]);
    const deadBalData = await deadBalRes.json();
    const totalSupplyData = await totalSupplyRes.json();
    // Decode total supply from Clarity response
    let totalSupplyDisplay = WHALE_TOTAL_SUPPLY;
    if (totalSupplyData.okay && typeof totalSupplyData.result === 'string') {
        const hex = totalSupplyData.result.replace('0x0701', '');
        const raw = parseInt(hex, 16);
        if (!isNaN(raw) && raw > 0)
            totalSupplyDisplay = raw / 1_000_000;
    }
    // Decode dead address balance
    let burnedDisplay = 0;
    if (deadBalData.okay && typeof deadBalData.result === 'string') {
        const hex = deadBalData.result.replace('0x0701', '');
        const raw = parseInt(hex, 16);
        if (!isNaN(raw))
            burnedDisplay = raw / 1_000_000;
    }
    return c.json({
        success: true,
        data: {
            description: 'WHALE burn statistics',
            supply: {
                total_max: WHALE_TOTAL_SUPPLY,
                current_supply: totalSupplyDisplay,
                burned: burnedDisplay,
                circulating: totalSupplyDisplay - burnedDisplay,
                burn_percent: totalSupplyDisplay > 0 ? ((burnedDisplay / totalSupplyDisplay) * 100).toFixed(4) + '%' : '0%',
            },
            dead_address: DEAD_ADDRESS,
            dead_address_balance_raw: deadBalData,
            total_supply_raw: totalSupplyData,
            burn_mechanism: '1 WHALE burned per platform action via whale-access-v1.pay-for-action',
            buyback_mechanism: '50% of treasury fees used to buy back and burn WHALE',
            status: burnedDisplay === 0 ? 'bootstrap_phase' : 'active',
            note: burnedDisplay === 0 ? 'Platform in bootstrap phase — first burns will appear as agents use whale-access-v1.pay-for-action' : `${burnedDisplay} WHALE burned to date`,
            fetched_at: new Date().toISOString(),
        },
        payment: { txId: payment?.settleResult?.txId ?? null, sender: payment?.payerAddress ?? null, settle: payment?.settleResult ?? null },
        copyright: 'COPYRIGHT 2026 Flying Whale — ALL RIGHTS RESERVED',
    });
});
// ─── Paid: Agent Leaderboard ──────────────────────────────────────────────────
app.get('/api/execution/agents', (0, x402_middleware_1.x402Middleware)({ amount: '1000', tokenType: 'STX' }), async (c) => {
    const payment = c.get('x402');
    const scoringEvents = await getContractEvents(SCORING_CONTRACT, 50);
    const ownerTxData = await getAccountTxs(OWNER, 5);
    return c.json({
        success: true,
        data: {
            description: 'Agent leaderboard — whale-scoring-v1 reputation data',
            scoring_contract: SCORING_CONTRACT,
            scoring_status: 'bootstrap_phase',
            max_score: 620,
            governance_thresholds: { basic: 50, full: 150, council: 300 },
            leaderboard: [
                {
                    rank: 1,
                    address: OWNER,
                    identity: 'zaghmout.btc | ERC-8004 #54',
                    erc8004: '#54',
                    score: 485,
                    tier: 'Council',
                    total_txs: ownerTxData.total,
                    verified: true,
                    genesis: true,
                    explorer: `https://explorer.hiro.so/address/${OWNER}?chain=mainnet`,
                },
            ],
            scoring_events: scoringEvents,
            tiers: {
                basic: { whale_required: 100, score_threshold: 50 },
                pro: { whale_required: 1000, score_threshold: 150 },
                elite: { whale_required: 10000, score_threshold: 300 },
                council: { whale_required: 10000, score_threshold: 485 },
            },
            note: 'whale-scoring-v1 in bootstrap phase — leaderboard will expand as agents register',
            fetched_at: new Date().toISOString(),
        },
        payment: { txId: payment?.settleResult?.txId ?? null, sender: payment?.payerAddress ?? null, settle: payment?.settleResult ?? null },
        copyright: 'COPYRIGHT 2026 Flying Whale — ALL RIGHTS RESERVED',
    });
});
// ─── Paid: Platform Stats ─────────────────────────────────────────────────────
app.get('/api/execution/stats', (0, x402_middleware_1.x402Middleware)({ amount: '1000', tokenType: 'STX' }), async (c) => {
    const payment = c.get('x402');
    const [poolEvents, ownerTxData, treasuryTxData, ipTotal, earnings] = await Promise.all([
        getContractEvents(POOL_CONTRACT, 1),
        getAccountTxs(OWNER, 5),
        getAccountTxs(TREASURY_CONTRACT, 5),
        getIpStoreTotal(),
        getEarningsStx(),
    ]);
    const lastPoolEvent = poolEvents[0];
    const decoded = lastPoolEvent ? decodePoolEvent(lastPoolEvent) : null;
    const whaleDisplay = decoded ? decoded.xBalance / 1_000_000 : 0;
    const wstxDisplay = decoded ? decoded.yBalance / 1_000_000 : 0;
    const price = wstxDisplay > 0 && whaleDisplay > 0 ? wstxDisplay / whaleDisplay : 0;
    return c.json({
        success: true,
        data: {
            description: 'Flying Whale platform statistics',
            platform: {
                skills: 114,
                categories: 11,
                contracts: 10,
                os_layers: 8,
                os_name: 'Sovereign Agent OS',
                network: 'Stacks Mainnet',
                dex_listings: 1,
                coingecko_request: 'CL0704260002',
                cmc_ticket: '#1351355',
                owner: 'zaghmout.btc | ERC-8004 #54',
                erc8004: '#54',
                genesis_txs: ownerTxData.total,
            },
            token: {
                symbol: 'WHALE',
                contract: WHALE_CONTRACT,
                total_supply: WHALE_TOTAL_SUPPLY,
                decimals: 6,
                deflationary: true,
                burn_per_action: 1,
            },
            pool: {
                id: 42,
                pair: 'WHALE/wSTX',
                dex: 'Bitflow',
                fee_bps: 55,
                whale_liquidity: whaleDisplay,
                wstx_liquidity: wstxDisplay,
                price_stx_per_whale: price,
                price_whale_per_stx: price > 0 ? 1 / price : 0,
                last_event: lastPoolEvent ?? null,
                bitflow_url: 'https://app.bitflow.finance',
            },
            treasury: {
                contract: TREASURY_CONTRACT,
                recent_txs: treasuryTxData.total,
                burn_percent: 50,
            },
            contracts: {
                layer1_identity: SCORING_CONTRACT,
                layer2_economy: WHALE_CONTRACT,
                layer3_execution: ACCESS_CONTRACT,
                layer4_governance: GOVERNANCE_CONTRACT,
                layer5_memory: `${OWNER}.whale-ip-store-v1`,
                layer6_voice: 'x402-api + nostr',
                layer7_verify: VERIFY_CONTRACT,
                pool: POOL_CONTRACT,
                treasury: TREASURY_CONTRACT,
                arb: `${OWNER}.whale-arb-v1`,
                wwhale: `${OWNER}.token-wwhale`,
                router: `${OWNER}.whale-router-v1`,
                gate: `${OWNER}.whale-gate-v1`,
                signal_registry: `${OWNER}.whale-signal-registry-v1`,
            },
            sovereign_agent_os: {
                version: '1.0',
                total_layers: 7,
                verify_endpoint: VERIFY_CONTRACT,
                integration: `(try! (contract-call? '${VERIFY_CONTRACT} verify-agent agent u150))`,
                whitepaper: 'https://flying-whale-marketplace-production.up.railway.app',
            },
            ip_registry: {
                contract: `${OWNER}.whale-ip-store-v1`,
                registrations: ipTotal,
                verify: `https://explorer.hiro.so/txid/c5cccb46f055369b121b99c6c0c1ea98bf018d808b82aa271d89e028abf4e6c2?chain=mainnet`,
            },
            earnings: {
                total_stx_received: earnings.total_received_stx,
                payment_count: earnings.payment_count,
                recent_payout_txids: earnings.recent_payout_txids,
                payment_address: OWNER,
            },
            explorer: `https://explorer.hiro.so/address/${OWNER}?chain=mainnet`,
            fetched_at: new Date().toISOString(),
        },
        payment: {
            txId: payment?.settleResult?.txId ?? null,
            sender: payment?.payerAddress ?? null,
            settle: payment?.settleResult ?? null,
        },
        copyright: 'COPYRIGHT 2026 Flying Whale — ALL RIGHTS RESERVED',
    });
});
// ─── Paid: Premium Intelligence ───────────────────────────────────────────────
app.post('/api/intelligence/premium', (0, x402_middleware_1.x402Middleware)({ amount: '10000', tokenType: 'STX' }), async (c) => {
    const payment = c.get('x402');
    const body = await c.req.json().catch(() => ({}));
    const [poolData, burnEvents, execStream] = await Promise.all([
        getPoolData(),
        getContractEvents(ACCESS_CONTRACT, 100),
        getAccountTxs(OWNER, 50),
    ]);
    return c.json({
        success: true,
        data: {
            query: body.query || 'full intelligence report',
            type: body.type || 'comprehensive',
            intelligence: {
                pool_state: poolData,
                burn_events: burnEvents,
                execution_history: execStream,
                analysis: {
                    note: 'This is raw on-chain data. Apply your own analytics to derive insights.',
                    pool_ratio: 'Decode x-balance / y-balance from pool state for current WHALE/wSTX ratio',
                    burn_rate: 'Count burn events per time period for burn rate calculation',
                    execution_frequency: 'Count access-contract events for execution frequency',
                },
            },
            fetched_at: new Date().toISOString(),
        },
        payment: { txId: payment?.settleResult?.txId ?? null, sender: payment?.payerAddress ?? null, settle: payment?.settleResult ?? null },
        copyright: 'COPYRIGHT 2026 Flying Whale — ALL RIGHTS RESERVED',
        agreement: 'Data provided under Flying Whale Proprietary License v2.0 — Agreement-First Policy',
    });
});
// ─── Admin Dashboard ──────────────────────────────────────────────────────────
app.get('/admin', async (c) => {
    const [poolEvents, ipTotal, earnings, ownerTxData] = await Promise.all([
        getContractEvents(POOL_CONTRACT, 1),
        getIpStoreTotal(),
        getEarningsStx(),
        getAccountTxs(OWNER, 5),
    ]);
    const lastPoolEvent = poolEvents[0];
    const decoded = lastPoolEvent ? decodePoolEvent(lastPoolEvent) : null;
    const whaleDisplay = decoded ? (decoded.xBalance / 1_000_000).toFixed(2) : '—';
    const wstxDisplay = decoded ? (decoded.yBalance / 1_000_000).toFixed(4) : '—';
    const price = decoded && decoded.xBalance > 0 ? (decoded.yBalance / decoded.xBalance).toFixed(8) : '—';
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>🐋 Flying Whale — Admin Dashboard</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0A1628;color:#e0e6f0;font-family:'Segoe UI',system-ui,sans-serif;min-height:100vh}
.header{background:linear-gradient(135deg,#0d2137,#0A1628);border-bottom:2px solid #00B4D8;padding:24px 32px;display:flex;align-items:center;gap:16px}
.header h1{font-size:1.6rem;font-weight:700;color:#00B4D8}
.header span{font-size:0.85rem;color:#7a9ab8;margin-left:auto}
.badge{background:#F7931A22;border:1px solid #F7931A55;color:#F7931A;padding:3px 10px;border-radius:20px;font-size:0.75rem;font-weight:600}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;padding:24px 32px}
.card{background:#0d2137;border:1px solid #1a3a5c;border-radius:12px;padding:20px}
.card h2{font-size:0.8rem;text-transform:uppercase;letter-spacing:1px;color:#7a9ab8;margin-bottom:14px}
.metric{font-size:1.8rem;font-weight:700;color:#00B4D8;margin-bottom:4px}
.metric.green{color:#00e676}
.metric.orange{color:#F7931A}
.metric.yellow{color:#ffd600}
.label{font-size:0.8rem;color:#7a9ab8}
.row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #1a3a5c22}
.row:last-child{border-bottom:none}
.row .key{font-size:0.82rem;color:#7a9ab8}
.row .val{font-size:0.82rem;color:#e0e6f0;font-family:monospace;text-align:right;max-width:60%;word-break:break-all}
.status{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px}
.status.live{background:#00e676;box-shadow:0 0 6px #00e676}
.status.pending{background:#ffd600}
.status.submitted{background:#00B4D8}
a{color:#00B4D8;text-decoration:none}a:hover{text-decoration:underline}
.footer{padding:16px 32px;border-top:1px solid #1a3a5c;font-size:0.75rem;color:#7a9ab8;text-align:center}
.section-title{font-size:1rem;font-weight:600;color:#00B4D8;padding:24px 32px 0}
</style>
</head>
<body>
<div class="header">
  <div>
    <h1>🐋 Flying Whale</h1>
    <div style="font-size:0.8rem;color:#7a9ab8;margin-top:4px">Sovereign Agent OS — 8-Layer Bitcoin AI Infrastructure</div>
  </div>
  <div style="margin-left:auto;display:flex;flex-direction:column;align-items:flex-end;gap:6px">
    <span class="badge">ERC-8004 #54 — Genesis Council</span>
    <span style="font-size:0.75rem;color:#7a9ab8">v1.3.0 · Stacks Mainnet · ${new Date().toUTCString()}</span>
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

<p class="section-title">🏗️ Sovereign Agent OS — 8 Layers</p>
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

<p class="section-title">📋 Contract Registry</p>
<div class="grid">
  <div class="card" style="grid-column:1/-1">
    <div class="row"><span class="key">whale-v3</span><span class="val"><a href="https://explorer.hiro.so/address/${OWNER}.whale-v3?chain=mainnet" target="_blank">${OWNER}.whale-v3</a></span></div>
    <div class="row"><span class="key">xyk-pool-whale-wstx-v-1-3</span><span class="val"><a href="https://explorer.hiro.so/address/${POOL_CONTRACT}?chain=mainnet" target="_blank">${POOL_CONTRACT}</a></span></div>
    <div class="row"><span class="key">whale-treasury-v1</span><span class="val"><a href="https://explorer.hiro.so/address/${TREASURY_CONTRACT}?chain=mainnet" target="_blank">${TREASURY_CONTRACT}</a></span></div>
    <div class="row"><span class="key">whale-scoring-v1</span><span class="val"><a href="https://explorer.hiro.so/address/${SCORING_CONTRACT}?chain=mainnet" target="_blank">${SCORING_CONTRACT}</a></span></div>
    <div class="row"><span class="key">whale-access-v1</span><span class="val"><a href="https://explorer.hiro.so/address/${ACCESS_CONTRACT}?chain=mainnet" target="_blank">${ACCESS_CONTRACT}</a></span></div>
    <div class="row"><span class="key">whale-verify-v1</span><span class="val"><a href="https://explorer.hiro.so/address/${VERIFY_CONTRACT}?chain=mainnet" target="_blank">${VERIFY_CONTRACT}</a></span></div>
    <div class="row"><span class="key">whale-governance-v1</span><span class="val"><a href="https://explorer.hiro.so/address/${GOVERNANCE_CONTRACT}?chain=mainnet" target="_blank">${GOVERNANCE_CONTRACT}</a></span></div>
    <div class="row"><span class="key">whale-ip-store-v1</span><span class="val"><a href="https://explorer.hiro.so/address/${OWNER}.whale-ip-store-v1?chain=mainnet" target="_blank">${OWNER}.whale-ip-store-v1</a></span></div>
    <div class="row"><span class="key">whale-router-v1</span><span class="val"><a href="https://explorer.hiro.so/address/${OWNER}.whale-router-v1?chain=mainnet" target="_blank">${OWNER}.whale-router-v1</a></span></div>
    <div class="row"><span class="key">whale-gate-v1</span><span class="val"><a href="https://explorer.hiro.so/address/${OWNER}.whale-gate-v1?chain=mainnet" target="_blank">${OWNER}.whale-gate-v1</a></span></div>
    <div class="row"><span class="key">whale-signal-registry-v1</span><span class="val"><a href="https://explorer.hiro.so/address/${OWNER}.whale-signal-registry-v1?chain=mainnet" target="_blank">${OWNER}.whale-signal-registry-v1</a></span></div>
    <div class="row"><span class="key">whale-arb-v1</span><span class="val"><a href="https://explorer.hiro.so/address/${OWNER}.whale-arb-v1?chain=mainnet" target="_blank">${OWNER}.whale-arb-v1</a></span></div>
  </div>
</div>

<p class="section-title">🗓️ 2026-04-07 Milestones</p>
<div class="grid">
  <div class="card" style="grid-column:1/-1">
    <div class="row"><span class="key">✅ Bitflow WHALE→wSTX swap FIXED</span><span class="val"><a href="https://explorer.hiro.so/txid/cb31d7da62df052e56b32a4ca2a86290f8a64b7ae3e62c2fbef77c50f0bd42a7?chain=mainnet" target="_blank">TX cb31d7da</a></span></div>
    <div class="row"><span class="key">✅ whale-router-v1 deployed</span><span class="val"><a href="https://explorer.hiro.so/txid/cb15fed7a26e325fa333d849a4c2080aa4b51e7fe79cf99f49506d04fd93022b?chain=mainnet" target="_blank">Block 7500763</a></span></div>
    <div class="row"><span class="key">✅ whale-gate-v1 deployed</span><span class="val"><a href="https://explorer.hiro.so/txid/3b12575b94b3920a118a4ccf1f71a94b978971d2370a75d37baf0a46bb09291e?chain=mainnet" target="_blank">Block 7500768</a></span></div>
    <div class="row"><span class="key">✅ SIP-016 metadata on-chain</span><span class="val"><a href="https://explorer.hiro.so/txid/15c6b041f6fe1857a13c0caeb399bd55aff4ab6cf59c2a141280d558f6da1b79?chain=mainnet" target="_blank">TX 15c6b041</a></span></div>
    <div class="row"><span class="key">✅ CoinGecko submitted</span><span class="val">Request CL0704260002</span></div>
    <div class="row"><span class="key">✅ CoinMarketCap submitted</span><span class="val">Ticket #1351355</span></div>
    <div class="row"><span class="key">✅ ALEX exploit signal on-chain</span><span class="val"><a href="https://explorer.hiro.so/txid/a07149f3ccfd67e6d8fb9409c1b708faba4e0e22a3c1cc025791b8e4406bbc23?chain=mainnet" target="_blank">TX a07149f3</a></span></div>
  </div>
</div>

<div class="footer">
  COPYRIGHT 2026 Flying Whale — zaghmout.btc | ERC-8004 #54 | ALL RIGHTS RESERVED ·
  <a href="https://explorer.hiro.so/address/${OWNER}?chain=mainnet" target="_blank">Explorer</a> ·
  <a href="https://app.bitflow.finance" target="_blank">Bitflow</a> ·
  <a href="https://github.com/azagh72-creator/aibtc-mcp-server" target="_blank">GitHub</a>
</div>
</body></html>`;
    return c.html(html);
});
exports.default = app;
//# sourceMappingURL=index.js.map