<!--
  COPYRIGHT 2026 Flying Whale — zaghmout.btc | ERC-8004 #54 | ALL RIGHTS RESERVED
  Flying Whale Proprietary License v2.0 — Agreement-First Policy
  Owner: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW
  On-chain IP: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-ip-store-v1
  Enforcement: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-signal-registry-v1
  Stack: Multi-Layer Sovereignty Stack v2.0.0 — Sovereign Agent OS
-->

# Flying Whale — Order Book Reference

**Owner:** zaghmout.btc | ERC-8004 #54
**Policy:** Write operations (place/fill orders) require partnership agreement.

## Overview

The Order Book provides a decentralized order matching system for trading skills and services on the Flying Whale Marketplace.

## Order Types

- **Limit Orders**: Execute at specific price or better
- **Market Orders**: Execute immediately at best available price

## Order Sides

- **Buy (Bid)**: Offer to purchase at specific price
- **Sell (Ask)**: Offer to sell at specific price

## API Endpoints

### View Order Book

**Endpoint**: `GET /api/orderbook`

**Query Parameters**:
- `market`: Filter by market/skill
- `side`: `buy` or `sell` (default: both)

### Get Order Details

**Endpoint**: `GET /api/orderbook/:id`

### Place Order

**Endpoint**: `POST /api/orderbook`

**Request**:
```json
{
  "market": "hodlmm-pulse",
  "side": "buy",
  "type": "limit",
  "price": 100,
  "quantity": 1
}
```

### Fill Order

**Endpoint**: `POST /api/orderbook/:id/fill`

### Cancel Order

**Endpoint**: `DELETE /api/orderbook/:id`

## Fee Structure

| Tier | 30-Day Volume (STX) | Maker Fee | Taker Fee |
|------|---------------------|-----------|-----------|
| 1    | < 10,000           | 0.10%     | 0.20%     |
| 2    | 10,000 - 50,000    | 0.08%     | 0.15%     |
| 3    | 50,000 - 100,000   | 0.05%     | 0.10%     |
| 4    | > 100,000          | 0.02%     | 0.05%     |

## MCP Tool

```
# View the order book
flying_whale_list_orders

# Filter by side
flying_whale_list_orders { "side": "buy" }
```

## Best Practices

1. **Check Spread**: Review bid-ask spread before placing
2. **Use Limit Orders**: Better price control
3. **Monitor Fills**: Track partial fills
4. **Liquidity Check**: Ensure sufficient market depth
