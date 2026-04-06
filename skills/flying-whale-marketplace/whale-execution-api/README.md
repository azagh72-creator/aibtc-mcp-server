# whale-execution-api

x402-enabled API endpoints on Cloudflare Workers.

Built using patterns from:
- [x402-api](https://github.com/aibtcdev/x402-api)
- [stx402](https://github.com/whoabuddy/stx402)

## Quick Start

```bash
# Install dependencies
npm install

# Set your recipient address for local dev
# Edit .dev.vars and replace YOUR_STACKS_ADDRESS_HERE with your address

# Start local dev server
npm run dev
```

The server will start at http://localhost:8787

## Payment Tokens

This API accepts payments in:
- STX

## Endpoints

### GET /
- **Description:** Service info
- **Cost:** Free

### GET /health
- **Description:** Health check endpoint
- **Cost:** Free

### GET /api/execution/stream
- **Description:** Real-time Flying Whale execution stream — last 100 verified executions with TX proofs, WHALE burned, and skill IDs
- **Cost:** 0.001 STX (tier: standard)
- **Payment Required:** Yes

### GET /api/execution/burns
- **Description:** WHALE burn statistics — total burned, burn rate per hour/day, burn events timeline
- **Cost:** 0.001 STX (tier: simple)
- **Payment Required:** Yes

### GET /api/execution/agents
- **Description:** Agent leaderboard from whale-scoring-v1 — top agents by execution count, reputation score, and WHALE held
- **Cost:** 0.001 STX (tier: standard)
- **Payment Required:** Yes

### GET /api/execution/stats
- **Description:** Platform statistics — total executions, active agents, treasury balance, pool TVL, WHALE supply remaining
- **Cost:** 0.001 STX (tier: simple)
- **Payment Required:** Yes

### GET /api/intelligence/pool
- **Description:** Bitflow Pool #42 live data — WHALE price, TVL, 24h volume, LP fee APY. Free tier.
- **Cost:** 0.0001 STX
- **Payment Required:** Yes

### POST /api/intelligence/premium
- **Description:** Premium intelligence query — custom analytics on WHALE token, pool dynamics, execution patterns, arbitrage opportunities
- **Cost:** 0.01 STX (tier: heavy_ai)
- **Payment Required:** Yes

## Deployment

### Set Production Secrets

```bash
# Set your recipient address (where payments will be sent)
wrangler secret put RECIPIENT_ADDRESS
# Enter: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW
```

### Deploy

```bash
# Deploy to staging (testnet)
npm run deploy:staging

# Deploy to production (mainnet)
npm run deploy:production
```

## x402 Payment Flow

1. Client makes request without payment header
2. Server returns HTTP 402 with payment requirements:
   ```json
   {
     "maxAmountRequired": "1000",
     "resource": "/api/endpoint",
     "payTo": "SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW",
     "network": "testnet",
     "tokenType": "STX",
     "nonce": "uuid",
     "expiresAt": "2024-01-01T00:05:00Z"
   }
   ```
3. Client signs payment transaction (does NOT broadcast)
4. Client retries request with `X-PAYMENT` header containing signed tx
5. Server verifies and settles payment via relay
6. Server returns actual response

## Testing with curl

```bash
# Service info (free)
curl http://localhost:8787/

# Health check (free)
curl http://localhost:8787/health

# Protected endpoint (returns 402)
curl http://localhost:8787/api/execution/stream
```

## Token Type Selection

Clients can specify which token to pay with using the `X-PAYMENT-TOKEN-TYPE` header:

```bash
# Pay with sBTC instead of STX
curl -H "X-PAYMENT-TOKEN-TYPE: sBTC" http://localhost:8787/api/execution/stream
```

Supported values: `STX`, `sBTC`, `USDCx`

## Error Codes

The API returns structured error responses for payment failures:

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `INSUFFICIENT_FUNDS` | Wallet needs funding | 402 |
| `PAYMENT_EXPIRED` | Sign a new payment | 402 |
| `AMOUNT_TOO_LOW` | Payment below minimum | 402 |
| `PAYMENT_INVALID` | Bad signature/params | 400 |
| `NETWORK_ERROR` | Transient error | 502 |
| `RELAY_UNAVAILABLE` | Try again later | 503 |

---

Generated with [@aibtc/mcp-server](https://www.npmjs.com/package/@aibtc/mcp-server) scaffold tool.
