// BigInt.toJSON polyfill for JSON.stringify compatibility
(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function () {
  return this.toString();
};

// COPYRIGHT 2026 Flying Whale - zaghmout.btc | ERC-8004 #54
// ALL RIGHTS RESERVED — Flying Whale Proprietary License v2.0
// Execution Layer API — x402 paid endpoints

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { x402Middleware } from './x402-middleware';
import type { X402Context } from './x402-middleware';

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
const GATE_CONTRACT = `${OWNER}.whale-gate-v1`;
const ROUTER_CONTRACT = `${OWNER}.whale-router-v1`;
const DEAD_ADDRESS = 'SP000000000000000000002Q6VF78';

// WHALE tier thresholds (micro-WHALE, 6 decimals)
const SCOUT_MIN = 100_000_000;    // 100 WHALE
const AGENT_MIN = 1_000_000_000;  // 1,000 WHALE
const ELITE_MIN = 10_000_000_000; // 10,000 WHALE
const WHALE_TOTAL_SUPPLY = 12_616_800;

// ─── Types ────────────────────────────────────────────────────────────────────
type Env = {
  RECIPIENT_ADDRESS: string;
  NETWORK: string;
  RELAY_URL: string;
};

type Variables = {
  x402?: X402Context;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function stacksReadOnly(contract: string, fn: string, args: unknown[] = []): Promise<unknown> {
  const [addr, name] = contract.split('.');
  const res = await fetch(`${STACKS_API}/v2/contracts/call-read/${addr}/${name}/${fn}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sender: OWNER, arguments: args }),
  });
  return res.json();
}

async function getTokenBalance(contract: string, address: string): Promise<number> {
  const [addr, name] = contract.split('.');
  const res = await fetch(`${STACKS_API}/v2/contracts/call-read/${addr}/${name}/get-balance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sender: address, arguments: [`0x0516${Buffer.from(address).toString('hex')}`] }),
  });
  const data: Record<string, unknown> = await res.json();
  if (data.okay && typeof data.result === 'string') {
    const hex = (data.result as string).replace('0x0701', '');
    return parseInt(hex, 16);
  }
  return 0;
}

async function getPoolData(): Promise<Record<string, unknown>> {
  const [addr, name] = POOL_CONTRACT.split('.');
  const res = await fetch(`${STACKS_API}/v2/contracts/call-read/${addr}/${name}/get-pool`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sender: OWNER, arguments: [] }),
  });
  const data: Record<string, unknown> = await res.json();
  return data as Record<string, unknown>;
}

async function getContractEvents(contract: string, limit = 20): Promise<unknown[]> {
  const res = await fetch(`${STACKS_API}/extended/v1/contract/${contract}/events?limit=${limit}`);
  const data: Record<string, unknown> = await res.json();
  return (data.results as unknown[]) || [];
}

async function getAccountTxs(address: string, limit = 10): Promise<{ total: number; results: unknown[] }> {
  const res = await fetch(`${STACKS_API}/extended/v1/address/${address}/transactions?limit=${limit}`);
  const data: Record<string, unknown> = await res.json();
  return { total: (data.total as number) || 0, results: (data.results as unknown[]) || [] };
}

async function getIpStoreTotal(): Promise<number> {
  try {
    const data = await stacksReadOnly(`${OWNER}.whale-ip-store-v1`, 'get-total') as Record<string, unknown>;
    if (data.okay && typeof data.result === 'string') {
      const hex = (data.result as string).replace('0x', '');
      if (hex.startsWith('0701')) {
        const raw = parseInt(hex.slice(4), 16);
        if (!isNaN(raw)) return raw;
      }
    }
  } catch { /* ignore */ }
  return 0;
}

async function getEarningsStx(): Promise<{ total_received_stx: number; payment_count: number; recent_payout_txids: string[] }> {
  try {
    const res = await fetch(`${STACKS_API}/extended/v1/address/${OWNER}/transactions?limit=50`);
    const data: Record<string, unknown> = await res.json();
    const txs = (data.results as Record<string, unknown>[]) || [];
    const incoming = txs.filter(tx => {
      if (tx.tx_type !== 'token_transfer') return false;
      const tt = tx.token_transfer as Record<string, unknown>;
      return tt?.recipient_address === OWNER;
    });
    const total = incoming.reduce((sum, tx) => {
      const tt = tx.token_transfer as Record<string, unknown>;
      return sum + (parseInt(String(tt?.amount || '0')) / 1_000_000);
    }, 0);
    const txids = incoming.slice(0, 5).map(tx => String(tx.tx_id || ''));
    return { total_received_stx: total, payment_count: incoming.length, recent_payout_txids: txids };
  } catch { /* ignore */ }
  return { total_received_stx: 0, payment_count: 0, recent_payout_txids: [] };
}

function decodeUint(hex: string): number {
  // Clarity uint: 0x01 prefix + 16 bytes big-endian
  const clean = hex.replace('0x', '');
  if (clean.startsWith('01') && clean.length === 34) {
    return parseInt(clean.slice(2), 16);
  }
  return 0;
}

function decodePoolEvent(event: Record<string, unknown>): { xBalance: number; yBalance: number } | null {
  try {
    const log = event.contract_log as Record<string, unknown>;
    const value = log?.value as Record<string, unknown>;
    const repr = value?.repr as string;
    if (!repr) return null;
    // Parse (tuple (action "update-pool-balances") (data (tuple (x-balance uN) (y-balance uN))))
    const xMatch = repr.match(/x-balance\s+u(\d+)/);
    const yMatch = repr.match(/y-balance\s+u(\d+)/);
    if (!xMatch || !yMatch) return null;
    return { xBalance: parseInt(xMatch[1]), yBalance: parseInt(yMatch[1]) };
  } catch { return null; }
}

// ─── WHALE Gate Helper ────────────────────────────────────────────────────────

async function getWhaleBalance(address: string): Promise<number> {
  try {
    const res = await fetch(`${STACKS_API}/v2/contracts/call-read/${OWNER}/whale-v3/get-balance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: OWNER, arguments: [`0x0516${Buffer.from(address).toString('hex')}`] }),
    });
    const data: Record<string, unknown> = await res.json();
    if (data.okay && typeof data.result === 'string') {
      const hex = (data.result as string).replace('0x0701', '');
      const raw = parseInt(hex, 16);
      return isNaN(raw) ? 0 : raw;
    }
  } catch { /* ignore */ }
  return 0;
}

function getWhaleTier(bal: number): string {
  if (bal >= ELITE_MIN) return 'Elite';
  if (bal >= AGENT_MIN) return 'Agent';
  if (bal >= SCOUT_MIN) return 'Scout';
  return 'None';
}

function buildGateResponse(bal: number, address: string) {
  const tier = getWhaleTier(bal);
  const hasAccess = bal >= SCOUT_MIN;
  return {
    address,
    whale_balance: bal / 1_000_000,
    tier,
    has_access: hasAccess,
    features: {
      marketplace: bal >= SCOUT_MIN,
      intelligence: bal >= AGENT_MIN,
      execution_api: bal >= AGENT_MIN,
      premium_data: bal >= ELITE_MIN,
      governance: bal >= ELITE_MIN,
    },
    upgrade: hasAccess ? null : {
      message: 'Buy WHALE to unlock all Flying Whale features',
      buy_at: 'https://app.bitflow.finance',
      contract: WHALE_CONTRACT,
      min_scout: '100 WHALE',
      min_agent: '1,000 WHALE',
      min_elite: '10,000 WHALE',
    },
    gate_contract: GATE_CONTRACT,
    router_contract: ROUTER_CONTRACT,
  };
}

// ─── App ──────────────────────────────────────────────────────────────────────
const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.use('*', cors({
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
  c.res.headers.set('X-Fw-Owner',    'SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW');
  c.res.headers.set('X-Fw-Identity', 'Flying Whale | zaghmout.btc | ERC-8004 #54');
  c.res.headers.set('X-Fw-Registry', 'SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-ip-store-v1');
  c.res.headers.set('X-Fw-License',  'Flying Whale Proprietary License v2.0');
  c.res.headers.set('X-Fw-Verify',   'https://explorer.hiro.so/txid/c5cccb46f055369b121b99c6c0c1ea98bf018d808b82aa271d89e028abf4e6c2?chain=mainnet');
});

app.use('*', async (c, next) => {
  if (c.req.path === '/health' || c.req.path === '/') return next();
  if (!c.env.RECIPIENT_ADDRESS) {
    return c.json({ error: 'Server configuration error', missing: 'RECIPIENT_ADDRESS' }, 503);
  }
  await next();
});

// ─── Public Endpoints ─────────────────────────────────────────────────────────

app.get('/', (c) => c.json({
  service: 'Flying Whale Execution API',
  version: '1.3.0',
  os: 'Sovereign Agent OS — 7-Layer Bitcoin AI Infrastructure',
  owner: 'zaghmout.btc | ERC-8004 #54 | Council 485pts',
  copyright: 'COPYRIGHT 2026 Flying Whale — ALL RIGHTS RESERVED',
  layers: {
    1: 'whale-scoring-v1 — Identity + Reputation (620pts)',
    2: 'whale-v3 — Economy (WHALE token)',
    3: 'whale-access-v1 — Execution (tier-gated)',
    4: 'whale-governance-v1 — Governance (DAO)',
    5: 'whale-ip-store-v1 — Memory (SHA-256 IP registry)',
    6: 'x402 API + Nostr — Voice (signed comms)',
    7: 'whale-verify-v1 — Verification (composable gate)',
  },
  endpoints: {
    free: ['/health', '/api/intelligence/pool'],
    paid: ['/api/execution/stream', '/api/execution/burns', '/api/execution/agents', '/api/execution/stats', '/api/intelligence/premium'],
  },
  payment: { tokens: ['STX'], header: 'X-PAYMENT' },
  marketplace: 'https://flying-whale-marketplace-production.up.railway.app',
  verify_integration: VERIFY_CONTRACT,
  gate_integration: GATE_CONTRACT,
  router_integration: ROUTER_CONTRACT,
  access_model: {
    free: 'none — all real data is gated',
    scout: '100 WHALE → marketplace access',
    agent: '1,000 WHALE → intelligence + execution API',
    elite: '10,000 WHALE → all features + premium data',
    buy_at: 'https://app.bitflow.finance — WHALE/wSTX Pool #42',
  },
  philosophy: 'WHALE is not just a token. It is your membership, your key, your vote. No WHALE — no access.',
}));

// ─── WHALE Gate: Check Membership ────────────────────────────────────────────

app.get('/api/gate/check', async (c) => {
  const address = c.req.query('address');
  if (!address) {
    return c.json({
      error: 'address parameter required',
      example: '/api/gate/check?address=SP322...',
      buy_whale: 'https://app.bitflow.finance',
    }, 400);
  }
  const bal = await getWhaleBalance(address);
  const gate = buildGateResponse(bal, address);
  return c.json({
    success: true,
    data: gate,
    message: gate.has_access
      ? `Access GRANTED — ${gate.tier} tier (${gate.whale_balance} WHALE)`
      : `Access DENIED — Buy WHALE at app.bitflow.finance to unlock Flying Whale`,
    copyright: 'COPYRIGHT 2026 Flying Whale — ALL RIGHTS RESERVED',
  });
});

app.get('/health', (c) => c.json({
  status: 'ok',
  timestamp: new Date().toISOString(),
  owner: 'zaghmout.btc',
  network: 'mainnet',
}));

// ─── Free: Pool Data ──────────────────────────────────────────────────────────

app.get('/api/intelligence/pool',
  x402Middleware({ amount: '100', tokenType: 'STX' }),
  async (c) => {
    const payment = c.get('x402');
    const [poolEvents] = await Promise.all([
      getContractEvents(POOL_CONTRACT, 1),
    ]);

    const lastEvent = poolEvents[0] as Record<string, unknown> | undefined;
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
  }
);

// ─── Paid: Execution Stream ───────────────────────────────────────────────────

app.get('/api/execution/stream',
  x402Middleware({ amount: '1000', tokenType: 'STX' }),
  async (c) => {
    const payment = c.get('x402');
    const [poolEvents, ownerTxData, accessEvents, poolBalances] = await Promise.all([
      getContractEvents(POOL_CONTRACT, 20),
      getAccountTxs(OWNER, 50),
      getContractEvents(ACCESS_CONTRACT, 20),
      getContractEvents(POOL_CONTRACT, 1),
    ]);

    const lastPoolEvent = poolBalances[0] as Record<string, unknown> | undefined;
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
  }
);

// ─── Paid: Burn Statistics ────────────────────────────────────────────────────

app.get('/api/execution/burns',
  x402Middleware({ amount: '1000', tokenType: 'STX' }),
  async (c) => {
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

    const deadBalData: Record<string, unknown> = await deadBalRes.json();
    const totalSupplyData: Record<string, unknown> = await totalSupplyRes.json();

    // Decode total supply from Clarity response
    let totalSupplyDisplay = WHALE_TOTAL_SUPPLY;
    if (totalSupplyData.okay && typeof totalSupplyData.result === 'string') {
      const hex = (totalSupplyData.result as string).replace('0x0701', '');
      const raw = parseInt(hex, 16);
      if (!isNaN(raw) && raw > 0) totalSupplyDisplay = raw / 1_000_000;
    }

    // Decode dead address balance
    let burnedDisplay = 0;
    if (deadBalData.okay && typeof deadBalData.result === 'string') {
      const hex = (deadBalData.result as string).replace('0x0701', '');
      const raw = parseInt(hex, 16);
      if (!isNaN(raw)) burnedDisplay = raw / 1_000_000;
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
  }
);

// ─── Paid: Agent Leaderboard ──────────────────────────────────────────────────

app.get('/api/execution/agents',
  x402Middleware({ amount: '1000', tokenType: 'STX' }),
  async (c) => {
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
  }
);

// ─── Paid: Platform Stats ─────────────────────────────────────────────────────

app.get('/api/execution/stats',
  x402Middleware({ amount: '1000', tokenType: 'STX' }),
  async (c) => {
    const payment = c.get('x402');

    const [poolEvents, ownerTxData, treasuryTxData, ipTotal, earnings] = await Promise.all([
      getContractEvents(POOL_CONTRACT, 1),
      getAccountTxs(OWNER, 5),
      getAccountTxs(TREASURY_CONTRACT, 5),
      getIpStoreTotal(),
      getEarningsStx(),
    ]);

    const lastPoolEvent = poolEvents[0] as Record<string, unknown> | undefined;
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
          os_layers: 7,
          os_name: 'Sovereign Agent OS',
          network: 'Stacks Mainnet',
          dex_listings: 1,
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
  }
);

// ─── Paid: Premium Intelligence ───────────────────────────────────────────────

app.post('/api/intelligence/premium',
  x402Middleware({ amount: '10000', tokenType: 'STX' }),
  async (c) => {
    const payment = c.get('x402');
    const body = await c.req.json<{ query?: string; type?: string }>().catch(() => ({}));

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
  }
);

export default app;
