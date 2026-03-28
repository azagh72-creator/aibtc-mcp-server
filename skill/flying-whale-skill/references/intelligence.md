# Flying Whale - Intelligence Analytics Reference

## Overview

The Intelligence product provides comprehensive analytics and data intelligence for marketplace insights, helping users make data-driven decisions.

## Core Features

### Market Analytics

**Endpoint**: `GET /api/intelligence/market`

**Metrics Available**:
- **Volume**: Total transaction volume
- **Users**: Active user count and growth
- **Revenue**: Platform revenue and trends
- **Liquidity**: Market depth and liquidity metrics

**Timeframes**:
- `1h`: Last hour
- `24h`: Last 24 hours
- `7d`: Last 7 days
- `30d`: Last 30 days
- `90d`: Last 90 days
- `1y`: Last year

### Skill Performance Analytics

**Endpoint**: `GET /api/intelligence/skills/{skillId}`

**Metrics**:
- Views and impressions
- Downloads and purchases
- Revenue generated
- User ratings and reviews
- Geographic distribution
- Time-based trends

## Intelligence Reports

### Generate Custom Report

**Endpoint**: `POST /api/intelligence/report`

**Request**:
```json
{
  "type": "market" | "skill" | "user" | "category",
  "targetId": "skill_abc123",
  "period": "week" | "month" | "quarter" | "year",
  "format": "json" | "pdf" | "csv",
  "metrics": [
    "revenue",
    "growth",
    "engagement",
    "conversion"
  ],
  "includeCharts": true
}
```

## Real-Time Analytics

### WebSocket Stream

**Connect**:
```javascript
const ws = new WebSocket(
  'wss://flying-whale-marketplace-production.up.railway.app/intelligence/stream'
);

ws.on('message', (data) => {
  const analytics = JSON.parse(data);
  console.log('Real-time metric:', analytics);
});
```

## Best Practices

### Data Interpretation

1. **Consider Context**: Raw numbers need context
2. **Check Timeframes**: Compare like-with-like periods
3. **Multiple Metrics**: Don't rely on single metric
4. **Seasonal Patterns**: Account for seasonality
5. **External Factors**: Consider market conditions

## Integration Example
```typescript
import { FlyingWhaleSDK } from '@flying-whale/sdk';

const sdk = new FlyingWhaleSDK({
  apiKey: process.env.FLYING_WHALE_API_KEY
});

// Get market analytics
const market = await sdk.intelligence.getMarketAnalytics({
  timeframe: '7d',
  metric: 'volume'
});

// Get skill performance
const skillPerf = await sdk.intelligence.getSkillPerformance('skill_abc123');

// Generate report
const report = await sdk.intelligence.generateReport({
  type: 'skill',
  targetId: 'skill_abc123',
  period: 'month',
  format: 'pdf'
});
```

## Support

For analytics support:
- Email: analytics@flyingwhale.xyz
- Documentation: https://docs.flyingwhale.xyz/intelligence
- API Status: https://status.flyingwhale.xyz
