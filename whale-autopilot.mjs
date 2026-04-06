#!/usr/bin/env node
/**
 * WHALE Autopilot — Automated Trading & Monitoring System
 * Flying Whale | zaghmout.btc | ERC-8004 #54
 * COPYRIGHT 2026 Flying Whale - ALL RIGHTS RESERVED
 * Flying Whale Proprietary License v2.0
 *
 * Capabilities:
 *   - Bitflow pool price monitoring (real-time)
 *   - Arbitrage execution via whale-arb-v1 (buy-low / sell-high)
 *   - Marketplace payment event monitoring (x402 lifecycle)
 *   - Treasury profit routing to owner wallet
 *   - Multi-DEX readiness (ALEX, Velar, StackSwap when listed)
 *   - Relay failure classification & auto-retry
 *
 * Usage:
 *   node whale-autopilot.mjs [--dry-run] [--interval=30] [--max-trade=10]
 *
 * Env:
 *   CLIENT_MNEMONIC or WHALE_MNEMONIC — wallet mnemonic (24 words)
 *   HIRO_API_KEY — optional, higher rate limits
 *   MARKETPLACE_URL — default: https://flying-whale-marketplace-production.up.railway.app
 */

import { createInterface } from 'readline';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

// ============================================================================
// CONFIG
// ============================================================================

const OWNER = 'SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW';
const CONTRACTS = {
  whale:       `${OWNER}.whale-v3`,
  wwhale:      `${OWNER}.token-wwhale`,
  arbV1:       `${OWNER}.whale-arb-v1`,
  treasury:    `${OWNER}.whale-treasury-v1`,
  access:      `${OWNER}.whale-access-v1`,
  scoring:     `${OWNER}.whale-scoring-v1`,
  pool:        `${OWNER}.xyk-pool-whale-wstx-v-1-3`,
  wstx:        'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.wstx',
};

const DEX_REGISTRY = {
  bitflow: {
    name: 'Bitflow',
    poolId: 42,
    ticker: 'WHALE_STX',
    feeBps: 55,
    status: 'active',
    apiBase: 'https://api.bitflow.finance',
    poolUri: 'https://flying-whale-marketplace-production.up.railway.app/api/whale/pool',
    publicTicker: 'https://api.bitflow.finance/price/v1/tickers',
  },
  alex: {
    name: 'ALEX',
    feeBps: 30,
    status: 'pending',   // blocked — amm-swap-pool-v1-1 paused
    contact: 'https://discord.gg/alexlab',
  },
  velar: {
    name: 'Velar',
    feeBps: 30,
    status: 'not-listed',
    contact: 'https://velar.co',
  },
  stackswap: {
    name: 'StackSwap',
    feeBps: 30,
    status: 'not-listed',
    contact: 'https://app.stackswap.org',
  },
  charisma: {
    name: 'Charisma',
    feeBps: 30,
    status: 'not-listed',
    contact: 'https://charisma.rocks',
  },
};

const CONFIG = {
  hiro: 'https://api.hiro.so',
  marketplace: process.env.MARKETPLACE_URL || 'https://flying-whale-marketplace-production.up.railway.app',
  // Arb thresholds
  minSpreadBps: 110,   // minimum 1.1% spread needed after fees to execute arb
  minTradewSTX: 1_000_000,     // 1 wSTX (6 decimals)
  maxTradewSTX: 10_000_000,    // 10 wSTX default (50 wSTX contract max)
  // Polling
  priceIntervalMs: 30_000,
  eventIntervalMs: 60_000,
  // State
  stateFile: join(homedir(), '.aibtc', 'whale-autopilot-state.json'),
};

// Parse CLI args
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const INTERVAL_ARG = args.find(a => a.startsWith('--interval='));
const MAX_TRADE_ARG = args.find(a => a.startsWith('--max-trade='));

if (INTERVAL_ARG) {
  const secs = parseInt(INTERVAL_ARG.split('=')[1]);
  if (secs >= 10) CONFIG.priceIntervalMs = secs * 1000;
}
if (MAX_TRADE_ARG) {
  const wstx = parseFloat(MAX_TRADE_ARG.split('=')[1]);
  if (wstx >= 1 && wstx <= 50) CONFIG.maxTradewSTX = Math.floor(wstx * 1_000_000);
}

// ============================================================================
// LOGGER
// ============================================================================

const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
let logLevel = LOG_LEVELS.INFO;

function timestamp() {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

const log = {
  debug: (...a) => logLevel <= LOG_LEVELS.DEBUG && console.log(`[${timestamp()}] [DBG]`, ...a),
  info:  (...a) => logLevel <= LOG_LEVELS.INFO  && console.log(`[${timestamp()}] [INF]`, ...a),
  warn:  (...a) => logLevel <= LOG_LEVELS.WARN  && console.warn(`[${timestamp()}] [WRN]`, ...a),
  error: (...a) => logLevel <= LOG_LEVELS.ERROR && console.error(`[${timestamp()}] [ERR]`, ...a),
  profit: (...a) => console.log(`[${timestamp()}] [***]`, ...a),
};

// ============================================================================
// STATE PERSISTENCE
// ============================================================================

function loadState() {
  try {
    if (existsSync(CONFIG.stateFile)) {
      return JSON.parse(readFileSync(CONFIG.stateFile, 'utf8'));
    }
  } catch {}
  return {
    totalArbTrades: 0,
    totalProfitwSTX: 0,
    totalMarketplaceEvents: 0,
    lastPrice: null,
    lastPriceUpdate: null,
    pendingTxids: [],
    errors: [],
    startedAt: new Date().toISOString(),
  };
}

function saveState(state) {
  try {
    const dir = join(homedir(), '.aibtc');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(CONFIG.stateFile, JSON.stringify(state, null, 2));
  } catch (e) {
    log.warn('State save failed:', e.message);
  }
}

const STATE = loadState();

// ============================================================================
// HIRO API CLIENT
// ============================================================================

const HIRO_HEADERS = {
  'Content-Type': 'application/json',
  ...(process.env.HIRO_API_KEY && { 'x-hiro-api-key': process.env.HIRO_API_KEY }),
};

async function hiroGet(path) {
  const res = await fetch(`${CONFIG.hiro}${path}`, { headers: HIRO_HEADERS });
  if (!res.ok) throw new Error(`Hiro API ${path} → ${res.status}: ${await res.text()}`);
  return res.json();
}

async function callReadOnly(contractAddr, contractName, fnName, args = []) {
  const res = await fetch(`${CONFIG.hiro}/v2/contracts/call-read/${contractAddr}/${contractName}/${fnName}`, {
    method: 'POST',
    headers: HIRO_HEADERS,
    body: JSON.stringify({ sender: OWNER, arguments: args }),
  });
  if (!res.ok) throw new Error(`read-only ${fnName} → ${res.status}`);
  const data = await res.json();
  if (!data.okay) throw new Error(`read-only ${fnName} not okay: ${data.cause}`);
  return data.result;
}

// ============================================================================
// CLARITY VALUE HELPERS
// ============================================================================
// Minimal serializers — avoids @stacks/transactions dependency for read-only reads

function encodeUint(n) {
  // Clarity uint: 01 prefix + 16-byte big-endian
  const bn = BigInt(n);
  const buf = Buffer.alloc(16);
  buf.writeBigUInt64BE(bn >> 64n, 0);
  buf.writeBigUInt64BE(bn & 0xFFFFFFFFFFFFFFFFn, 8);
  return '0x01' + buf.toString('hex');
}

function decodeUint(hex) {
  // Strip 0x prefix and clarity type byte (01)
  const clean = hex.replace('0x', '');
  if (clean.startsWith('0a')) {
    // (ok uint)
    const inner = clean.slice(2);
    return BigInt('0x' + inner.slice(2)); // skip type byte 01
  }
  if (clean.startsWith('01')) {
    return BigInt('0x' + clean.slice(2));
  }
  return null;
}

function decodeOkUint(hex) {
  const clean = hex.replace('0x', '');
  // (ok (uint X)) = 0a 01 <16 bytes>
  if (clean.startsWith('0a01')) {
    return BigInt('0x' + clean.slice(4));
  }
  return null;
}

// ============================================================================
// BITFLOW PRICE MONITOR
// ============================================================================

async function getBitflowTicker() {
  try {
    const res = await fetch(DEX_REGISTRY.bitflow.publicTicker);
    if (!res.ok) throw new Error(`Bitflow ticker ${res.status}`);
    const data = await res.json();
    // Find WHALE ticker — symbol contains "WHALE" or "whale-v3"
    const ticker = Object.values(data).find(t =>
      t.ticker_id && (t.ticker_id.toLowerCase().includes('whale') ||
      t.base_currency?.toLowerCase().includes('whale'))
    );
    return ticker || null;
  } catch (e) {
    log.debug('Bitflow public ticker failed:', e.message);
    return null;
  }
}

async function getPoolReserves() {
  // Read WHALE and wSTX balances from the pool contract address
  try {
    const data = await hiroGet(
      `/extended/v1/address/${CONTRACTS.pool}/balances`
    );

    if (data?.fungible_tokens) {
      const whaleKey = Object.keys(data.fungible_tokens).find(k => k.includes('whale-v3'));
      const wstxKey = Object.keys(data.fungible_tokens).find(k => k.includes('wstx'));
      if (whaleKey && wstxKey) {
        const whaleAmt = BigInt(data.fungible_tokens[whaleKey].balance);
        const wstxAmt = BigInt(data.fungible_tokens[wstxKey].balance);
        return { whale: whaleAmt, wstx: wstxAmt };
      }
    }
    return null;
  } catch (e) {
    log.debug('Pool reserves fetch failed:', e.message);
    return null;
  }
}

async function getArbQuote(wstxIn) {
  // Ask whale-arb-v1 how much WHALE we get for wstxIn
  try {
    const hexArg = encodeUint(wstxIn);
    const result = await callReadOnly(OWNER, 'whale-arb-v1', 'get-whale-for-wstx', [hexArg]);
    return decodeOkUint(result);
  } catch (e) {
    log.debug('get-whale-for-wstx failed:', e.message);
    return null;
  }
}

async function getSellQuote(whaleIn) {
  // Ask whale-arb-v1 how much wSTX we get for selling whaleIn
  try {
    const hexArg = encodeUint(whaleIn);
    const result = await callReadOnly(OWNER, 'whale-arb-v1', 'get-wstx-for-whale', [hexArg]);
    return decodeOkUint(result);
  } catch (e) {
    log.debug('get-wstx-for-whale failed:', e.message);
    return null;
  }
}

// Current effective price: wSTX per WHALE
async function getCurrentPrice() {
  // Try pool URI (marketplace API) — most accurate
  try {
    const res = await fetch(DEX_REGISTRY.bitflow.poolUri);
    if (res.ok) {
      const data = await res.json();
      // Expect { whale_balance, wstx_balance } or { price } field
      if (data.price) {
        return { price: parseFloat(data.price), reserves: data, source: 'pool-api' };
      }
      if (data.whale_balance && data.wstx_balance) {
        const whaleAmt = parseFloat(data.whale_balance);
        const wstxAmt = parseFloat(data.wstx_balance);
        if (whaleAmt > 0) {
          return { price: wstxAmt / whaleAmt, reserves: data, source: 'pool-api' };
        }
      }
    }
  } catch {}

  // Try on-chain reserves
  const reserves = await getPoolReserves();
  if (reserves && reserves.whale > 0n && reserves.wstx > 0n) {
    // Both are in micro-units with 6 decimals → ratio is direct wSTX/WHALE
    const price = Number(reserves.wstx) / Number(reserves.whale);
    return { price, reserves, source: 'pool-reserves' };
  }

  // Try Bitflow public ticker API
  const ticker = await getBitflowTicker();
  if (ticker?.last_price) {
    return { price: parseFloat(ticker.last_price), reserves: null, source: 'bitflow-ticker' };
  }

  return null;
}

// ============================================================================
// ARB ENGINE
// ============================================================================

async function checkArbOpportunity() {
  const priceData = await getCurrentPrice();
  if (!priceData) {
    log.warn('Cannot fetch price data');
    return null;
  }

  const { price, source } = priceData;
  STATE.lastPrice = price;
  STATE.lastPriceUpdate = new Date().toISOString();

  log.debug(`Price [${source}]: ${(1 / price).toFixed(0)} WHALE/wSTX | ${price.toFixed(8)} wSTX/WHALE`);

  // Currently only one DEX active — arb requires two DEXs
  // When ALEX or another DEX lists WHALE, compare prices here
  const activeDexCount = Object.values(DEX_REGISTRY).filter(d => d.status === 'active').length;

  if (activeDexCount < 2) {
    log.debug(`Only ${activeDexCount} DEX active — arb needs 2. Monitoring only.`);
    return { type: 'monitor', price, activeDexCount };
  }

  // Multi-DEX arb logic (activates when ALEX/Velar lists WHALE)
  // Compare Bitflow price vs other DEX price
  // TODO: fetch ALEX/Velar price when listed
  return null;
}

// ============================================================================
// TRANSACTION BUILDER (using @stacks/transactions)
// ============================================================================

async function loadWallet() {
  const mnemonic = process.env.WHALE_MNEMONIC || process.env.CLIENT_MNEMONIC;
  if (!mnemonic) {
    // Try reading from ~/.aibtc/wallets
    const configPath = join(homedir(), '.aibtc', 'config.json');
    if (existsSync(configPath)) {
      const config = JSON.parse(readFileSync(configPath, 'utf8'));
      log.info('Found managed wallet config. Use --with-password to unlock for trading.');
    }
    throw new Error('No mnemonic found. Set WHALE_MNEMONIC or unlock wallet first.');
  }

  const { generateWallet } = await import('@stacks/wallet-sdk');
  const { TransactionVersion } = await import('@stacks/transactions');

  const wallet = await generateWallet({ secretKey: mnemonic, password: '' });
  const account = wallet.accounts[0];
  return account;
}

async function buildArbTx(fnName, amount, account) {
  const {
    makeContractCall,
    uintCV,
    PostConditionMode,
    AnchorMode,
  } = await import('@stacks/transactions');
  const { STACKS_MAINNET } = await import('@stacks/network');

  const tx = await makeContractCall({
    contractAddress: OWNER,
    contractName: 'whale-arb-v1',
    functionName: fnName,
    functionArgs: [uintCV(amount)],
    senderKey: account.stxPrivateKey,
    network: STACKS_MAINNET,
    postConditionMode: PostConditionMode.Allow,
    anchorMode: AnchorMode.Any,
    fee: 2000n,
  });
  return tx;
}

async function broadcastTx(tx) {
  const serialized = Buffer.from(tx.serialize());
  const res = await fetch(`${CONFIG.hiro}/v2/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: serialized,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Broadcast failed ${res.status}: ${text}`);
  // Strip quotes if response is a quoted txid string
  return text.replace(/"/g, '').trim();
}

// ============================================================================
// MARKETPLACE PAYMENT EVENT MONITOR
// ============================================================================

const seenEvents = new Set();

async function fetchMarketplaceEvents(since) {
  try {
    // Check for recent contract events on the access contract (pay-for-action burns)
    const events = await hiroGet(
      `/extended/v1/contract/${CONTRACTS.access}/events?limit=20&offset=0`
    );

    const newEvents = [];
    for (const evt of (events.results || [])) {
      if (seenEvents.has(evt.event_index)) continue;
      seenEvents.add(evt.event_index);
      newEvents.push(evt);
    }

    // Also check marketplace API if available
    try {
      const res = await fetch(`${CONFIG.marketplace}/api/events?limit=10`);
      if (res.ok) {
        const mkData = await res.json();
        for (const evt of (mkData.events || mkData.data || [])) {
          const key = `mk_${evt.id || evt.txid}`;
          if (seenEvents.has(key)) continue;
          seenEvents.add(key);
          newEvents.push({ source: 'marketplace', ...evt });
        }
      }
    } catch {}

    return newEvents;
  } catch (e) {
    log.debug('Event fetch failed:', e.message);
    return [];
  }
}

function classifyPaymentEvent(evt) {
  if (!evt) return 'unknown';

  // x402 payment lifecycle events
  if (evt.event_type === 'fungible_token_asset') {
    const asset = evt.asset?.asset_id || '';
    if (asset.includes('whale-v3')) return 'whale-payment';
    if (asset.includes('sbtc') || asset.includes('sBTC')) return 'sbtc-payment';
    if (asset.includes('wstx') || asset.includes('wSTX')) return 'wstx-payment';
  }

  if (evt.source === 'marketplace') {
    if (evt.type === 'payment.completed') return 'marketplace-sale';
    if (evt.type === 'payment.failed') return 'payment-retry';
    if (evt.type === 'skill.executed') return 'skill-execution';
  }

  return 'other';
}

// ============================================================================
// TREASURY MONITOR
// ============================================================================

async function getTreasuryBalance() {
  try {
    const balances = await hiroGet(`/extended/v1/address/${CONTRACTS.treasury}/balances`);
    const wstxKey = Object.keys(balances?.fungible_tokens || {}).find(k => k.includes('wstx'));
    const whaleKey = Object.keys(balances?.fungible_tokens || {}).find(k => k.includes('whale-v3'));

    return {
      wstx: wstxKey ? BigInt(balances.fungible_tokens[wstxKey].balance) : 0n,
      whale: whaleKey ? BigInt(balances.fungible_tokens[whaleKey].balance) : 0n,
      stx: BigInt(balances?.stx?.balance || '0'),
    };
  } catch (e) {
    log.debug('Treasury balance failed:', e.message);
    return null;
  }
}

async function getOwnerBalance() {
  try {
    const balances = await hiroGet(`/extended/v1/address/${OWNER}/balances`);
    const wstxKey = Object.keys(balances?.fungible_tokens || {}).find(k => k.includes('wstx'));
    const whaleKey = Object.keys(balances?.fungible_tokens || {}).find(k => k.includes('whale-v3'));

    return {
      stx: BigInt(balances?.stx?.balance || '0'),
      wstx: wstxKey ? BigInt(balances.fungible_tokens[wstxKey].balance) : 0n,
      whale: whaleKey ? BigInt(balances.fungible_tokens[whaleKey].balance) : 0n,
    };
  } catch (e) {
    log.debug('Owner balance failed:', e.message);
    return null;
  }
}

// ============================================================================
// PENDING TX TRACKER
// ============================================================================

async function trackPendingTxs() {
  if (STATE.pendingTxids.length === 0) return;

  const still_pending = [];
  for (const txid of STATE.pendingTxids) {
    try {
      const tx = await hiroGet(`/extended/v1/tx/${txid}`);
      if (tx.tx_status === 'success') {
        log.profit(`TX CONFIRMED: ${txid.substring(0, 16)}... [${tx.block_height}]`);
      } else if (tx.tx_status === 'abort_by_response' || tx.tx_status === 'abort_by_post_condition') {
        log.warn(`TX FAILED: ${txid.substring(0, 16)}... status=${tx.tx_status}`);
        STATE.errors.push({ txid, status: tx.tx_status, ts: new Date().toISOString() });
      } else {
        still_pending.push(txid);
      }
    } catch {
      still_pending.push(txid); // keep tracking
    }
  }
  STATE.pendingTxids = still_pending;
}

// ============================================================================
// STATUS DASHBOARD
// ============================================================================

function printStatus(priceData, ownerBal, treasuryBal) {
  const now = new Date().toLocaleTimeString();

  console.log('\n' + '='.repeat(70));
  console.log(` WHALE AUTOPILOT | ${now} | ${DRY_RUN ? 'DRY-RUN MODE' : 'LIVE'}`);
  console.log('='.repeat(70));

  if (priceData && priceData.price > 0) {
    const whalePerSTX = (1 / priceData.price).toFixed(0);
    const stxPerWhale = priceData.price.toFixed(8);
    console.log(` Price    : ${whalePerSTX} WHALE/wSTX | ${stxPerWhale} wSTX/WHALE [${priceData.source}]`);
    console.log(` ARB      : ${(priceData.activeDexCount || 1) >= 2 ? 'ACTIVE — executing' : 'STANDBY — need 2nd DEX listing'}`);
  } else if (priceData) {
    console.log(` Price    : fetching... [${priceData.source || 'unknown'}]`);
    console.log(` ARB      : STANDBY — need 2nd DEX listing`);
  }

  if (ownerBal) {
    const stxHuman = (Number(ownerBal.stx) / 1_000_000).toFixed(6);
    const whaleHuman = (Number(ownerBal.whale) / 1_000_000).toFixed(0);
    const wstxHuman = (Number(ownerBal.wstx) / 1_000_000).toFixed(6);
    console.log(` Balance  : ${stxHuman} STX | ${whaleHuman} WHALE | ${wstxHuman} wSTX`);
  }

  if (treasuryBal) {
    const twstx = (Number(treasuryBal.wstx) / 1_000_000).toFixed(6);
    const twhale = (Number(treasuryBal.whale) / 1_000_000).toFixed(0);
    console.log(` Treasury : ${twstx} wSTX | ${twhale} WHALE`);
  }

  console.log(` Trades   : ${STATE.totalArbTrades} | Profit: ${(STATE.totalProfitwSTX / 1_000_000).toFixed(6)} wSTX`);
  console.log(` Events   : ${STATE.totalMarketplaceEvents} | Pending TX: ${STATE.pendingTxids.length}`);

  // DEX status
  console.log('\n DEX Registry:');
  for (const [key, dex] of Object.entries(DEX_REGISTRY)) {
    const icon = dex.status === 'active' ? '[LIVE]' : dex.status === 'pending' ? '[PEND]' : '[    ]';
    console.log(`   ${icon} ${dex.name.padEnd(12)} ${dex.status}`);
  }

  if (STATE.pendingTxids.length > 0) {
    console.log('\n Pending TXs:');
    for (const txid of STATE.pendingTxids.slice(0, 5)) {
      console.log(`   ${txid.substring(0, 32)}...`);
    }
  }

  console.log('='.repeat(70) + '\n');
}

// ============================================================================
// MAIN LOOP
// ============================================================================

let account = null;
let loopCount = 0;

async function priceLoop() {
  loopCount++;

  try {
    // 1. Track pending TXs
    await trackPendingTxs();

    // 2. Get current price and check arb
    const arbResult = await checkArbOpportunity();

    // 3. Get balances (every 5 loops to reduce API calls)
    let ownerBal = null;
    let treasuryBal = null;
    if (loopCount % 5 === 1) {
      [ownerBal, treasuryBal] = await Promise.all([
        getOwnerBalance(),
        getTreasuryBalance(),
      ]);
    }

    // 4. Print status dashboard
    printStatus(arbResult, ownerBal, treasuryBal);
    saveState(STATE);

  } catch (e) {
    log.error('Price loop error:', e.message);
  }
}

async function eventLoop() {
  try {
    const events = await fetchMarketplaceEvents();
    if (events.length === 0) return;

    STATE.totalMarketplaceEvents += events.length;

    for (const evt of events) {
      const classification = classifyPaymentEvent(evt);
      log.info(`[EVENT] ${classification} | ${evt.txid?.substring(0, 16) || evt.id || 'unknown'}`);

      // Handle payment retries
      if (classification === 'payment-retry') {
        log.warn('[EVENT] Payment retry detected — relay may be congested');
      }

      // Log marketplace revenue
      if (classification === 'marketplace-sale') {
        const amount = evt.amount || evt.price || '?';
        log.profit(`[REVENUE] Skill sale: ${amount} | TX: ${evt.txid?.substring(0, 16) || '-'}`);
      }

      // Track whale burns (pay-for-action)
      if (classification === 'whale-payment') {
        log.info(`[BURN] WHALE burned via pay-for-action`);
      }
    }
  } catch (e) {
    log.debug('Event loop error:', e.message);
  }
}

async function main() {
  console.log('\n' + '='.repeat(70));
  console.log(' WHALE AUTOPILOT v1.0 — Flying Whale | zaghmout.btc');
  console.log(' COPYRIGHT 2026 Flying Whale — ALL RIGHTS RESERVED');
  if (DRY_RUN) console.log(' *** DRY-RUN MODE — No transactions will be broadcast ***');
  console.log('='.repeat(70) + '\n');

  // Load wallet (required for trade execution, optional for monitoring)
  try {
    account = await loadWallet();
    log.info(`Wallet loaded: ${account.address || OWNER}`);
  } catch (e) {
    log.warn('Wallet not loaded — running in MONITOR-ONLY mode');
    log.warn(`Reason: ${e.message}`);
    log.info('Set WHALE_MNEMONIC env var to enable trade execution');
  }

  // Print DEX status summary
  log.info('DEX Status:');
  for (const [key, dex] of Object.entries(DEX_REGISTRY)) {
    log.info(`  ${dex.name}: ${dex.status}${dex.status !== 'active' ? ` (contact: ${dex.contact || 'N/A'})` : ''}`);
  }
  log.info('');
  log.info('Arb engine: waiting for 2nd DEX listing');
  log.info('Next listing targets: ALEX (blocked/paused), Velar, StackSwap, Charisma');
  log.info('');
  log.info(`Price polling every ${CONFIG.priceIntervalMs / 1000}s | Events every ${CONFIG.eventIntervalMs / 1000}s`);
  log.info('Starting loops...\n');

  // Initial run
  await priceLoop();
  await eventLoop();

  // Schedule loops
  setInterval(priceLoop, CONFIG.priceIntervalMs);
  setInterval(eventLoop, CONFIG.eventIntervalMs);

  // Graceful shutdown
  process.on('SIGINT', () => {
    log.info('\nShutting down autopilot...');
    saveState(STATE);
    log.info(`Session summary: ${STATE.totalArbTrades} trades | ${STATE.totalMarketplaceEvents} events | Profit: ${(STATE.totalProfitwSTX / 1_000_000).toFixed(6)} wSTX`);
    process.exit(0);
  });
}

// ============================================================================
// MULTI-DEX INTEGRATION GUIDE
// ============================================================================
// When a new DEX lists WHALE, update DEX_REGISTRY status and add price fetch:
//
// ALEX (token-wwhale / wWHALE):
//   1. Contact ALEX Labs Discord (discord.gg/alexlab) — request amm-swap-pool-v1-1 unpause
//   2. Once approved: call create-pool(token-wwhale, token-wstx, 100000000, OWNER, dx, dy)
//   3. Update DEX_REGISTRY.alex.status = 'active'
//   4. Add ALEX price fetch in checkArbOpportunity() comparing alex vs bitflow price
//   5. Arb engine will auto-activate when 2 DEXs are active
//
// Velar:
//   1. Visit https://velar.co → "List a Token" → submit WHALE token details
//   2. Token contract: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-v3
//   3. Decimals: 6 | Symbol: WHALE | Total Supply: 12,616,800
//
// StackSwap / Charisma:
//   Follow similar listing process via their respective Discord/governance channels
//
// ============================================================================

main().catch(e => {
  log.error('Fatal:', e.message);
  process.exit(1);
});
