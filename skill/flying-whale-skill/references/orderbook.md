# Flying Whale - Order Book Reference

## Overview

The Order Book provides a decentralized order matching system for trading skills, services, and digital assets on the Flying Whale marketplace.

## Core Concepts

### Order Types

1. **Limit Orders**: Execute at specific price or better
2. **Market Orders**: Execute immediately at best available price
3. **Stop Orders**: Trigger when price reaches threshold
4. **Fill-or-Kill (FOK)**: Execute completely or cancel
5. **Immediate-or-Cancel (IOC)**: Execute partial fills, cancel remainder

### Order Sides

- **Buy (Bid)**: Offer to purchase at specific price
- **Sell (Ask)**: Offer to sell at specific price

### Order Status

- `pending`: Awaiting execution
- `partial`: Partially filled
- `filled`: Completely filled
- `cancelled`: Cancelled by user
- `expired`: Expired without fill

## API Endpoints

### View Order Book

**Endpoint**: `GET /api/orderbook`

**Query Parameters**:
- `market`: Trading pair (e.g., "SKILL/STX", "NFT/BTC")
- `side`: "buy", "sell", or "both"
- `depth`: Number of price levels (default: 20)

### Place Order

**Endpoint**: `POST /api/orderbook/orders`

**Request (Limit Order)**:
```json
{
  "market": "SKILL/STX",
  "side": "buy",
  "type": "limit",
  "price": 100,
  "quantity": 10,
  "timeInForce": "GTC",
  "postOnly": false
}
```

**Time in Force Options**:
- `GTC` (Good Till Cancelled): Default, stays until filled/cancelled
- `IOC` (Immediate or Cancel): Fill immediately or cancel
- `FOK` (Fill or Kill): Fill completely or cancel
- `DAY`: Cancel at end of day
- `GTD` (Good Till Date): Cancel at specific date

### Cancel Order

**Endpoint**: `DELETE /api/orderbook/orders/{orderId}`

## Fee Structure

### Trading Fees

| Tier | 30-Day Volume (STX) | Maker Fee | Taker Fee |
|------|---------------------|-----------|-----------|
| 1    | < 10,000           | 0.10%     | 0.20%     |
| 2    | 10,000 - 50,000    | 0.08%     | 0.15%     |
| 3    | 50,000 - 100,000   | 0.05%     | 0.10%     |
| 4    | > 100,000          | 0.02%     | 0.05%     |

## WebSocket Streaming

### Real-Time Order Book

**Connect**:
```javascript
const ws = new WebSocket(
  'wss://flying-whale-marketplace-production.up.railway.app/orderbook/stream'
);
```

**Subscribe**:
```json
{
  "action": "subscribe",
  "channels": ["orderbook", "trades"],
  "markets": ["SKILL/STX"]
}
```

## Integration Example
```typescript
import { FlyingWhaleSDK } from '@flying-whale/sdk';

const sdk = new FlyingWhaleSDK({
  apiKey: process.env.FLYING_WHALE_API_KEY
});

// View order book
const orderbook = await sdk.orderbook.getOrderBook('SKILL/STX');

// Place limit order
const order = await sdk.orderbook.placeOrder({
  market: 'SKILL/STX',
  side: 'buy',
  type: 'limit',
  price: 100,
  quantity: 10
});

// Check order status
const status = await sdk.orderbook.getOrderStatus(order.orderId);

// Cancel order
await sdk.orderbook.cancelOrder(order.orderId);
```

## Best Practices

### Order Placement

1. **Check Spread**: Review bid-ask spread before placing
2. **Use Limit Orders**: Better price control
3. **Post-Only for Makers**: Avoid taker fees
4. **Monitor Fills**: Track partial fills
5. **Set Time Limits**: Use DAY/GTD for short-term

### Risk Management

1. **Position Sizing**: Don't risk more than you can afford
2. **Stop Losses**: Use stop orders for protection
3. **Diversification**: Don't concentrate in single market
4. **Liquidity Check**: Ensure sufficient market depth

## Support

- Email: orderbook@flyingwhale.xyz
- Trading Support: https://support.flyingwhale.xyz
- API Docs: https://docs.flyingwhale.xyz/orderbook
