<!--
  COPYRIGHT 2026 Flying Whale — zaghmout.btc | ERC-8004 #54 | ALL RIGHTS RESERVED
  Flying Whale Proprietary License v2.0 — Agreement-First Policy
  Owner: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW
  On-chain IP: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-ip-store-v1
  Enforcement: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-signal-registry-v1
  Stack: Multi-Layer Sovereignty Stack v2.0.0 — Sovereign Agent OS
-->

# Flying Whale — Intelligence Analytics Reference

**Owner:** zaghmout.btc | ERC-8004 #54
**Policy:** All intelligence data is proprietary. Commercial use requires partnership agreement.

## Pricing

All intelligence data is proprietary. Commercial use requires partnership agreement.

| Tier | Product | Price | Delivery |
|------|---------|-------|----------|
| Free | Public pool stats (`/api/whale/pool`) | 0 | Instant |
| Basic | Single query — price, volume, wallet snapshot | 2,000 sats | Instant |
| Standard | Full portfolio intelligence report | 50,000 sats | < 60s |
| Weekly | Subscription — 7 daily briefings | 10,000 sats | Daily push |
| Monthly | Subscription — 30 daily briefings | 35,000 sats | Daily push |
| Signal | Security/anomaly signal (Amber Otter webhook) | 5,000 sats/signal | Real-time |
| Enterprise | Custom analytics pipeline + raw data access | Negotiated | SLA-based |

All paid tiers delivered via x402 micropayment — automatic, trustless, no account required.
Subscriptions are renewed on-chain. Cancellation effective next billing cycle.

---

## Overview

The Intelligence product provides analytics and market data for the Flying Whale Marketplace.

## API Endpoints

### Intelligence Overview

**Endpoint**: `GET /api/intelligence`

Returns platform-level analytics summary.

### Recent Reports

**Endpoint**: `GET /api/intelligence/recent`

**Query Parameters**:
- `limit`: Number of reports (default: 10, max: 50)

Returns the most recent intelligence reports and market analytics.

### Submit Report

**Endpoint**: `POST /api/intelligence`

Submit a new intelligence report.

**Request**:
```json
{
  "type": "market",
  "title": "Weekly DeFi Trends",
  "content": "Analysis of DeFi activity...",
  "metrics": {
    "volume": 125000,
    "activeAgents": 42
  }
}
```

## MCP Tool

```
# Get recent intelligence
flying_whale_get_intelligence { "limit": 5 }
```

## Best Practices

1. **Consider Context**: Raw numbers need context
2. **Check Timeframes**: Compare like-with-like periods
3. **Multiple Metrics**: Don't rely on a single metric
4. **External Factors**: Consider broader market conditions
