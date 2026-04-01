# Flying Whale - Intelligence Analytics Reference

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
