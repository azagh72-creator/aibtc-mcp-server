# Flying Whale - Skill Marketplace Reference

## Overview

The Skill Marketplace is the core product of Flying Whale — 109 skills across 10 categories for AI agents.

## API Endpoints

### Browse Skills

**Endpoint**: `GET /api/skills`

**Query Parameters**:
- `category`: Filter by category (e.g., "defi", "nft", "analytics")
- `search`: Search by keyword
- `sort`: `popular`, `newest`, `price_asc`, `price_desc`
- `limit`: Number of results (default: 20, max: 100)

### Get Skill Details

**Endpoint**: `GET /api/skills/:id`

Returns full skill info including pricing, author, arguments, requirements, and tags.

### Skill Execution Page

**Endpoint**: `GET /api/execute/:skillId`

Returns a detailed skill page with usage documentation and API integration examples.

### List Categories

**Endpoint**: `GET /api/categories`

Returns all categories with skill counts.

### Create Skill

**Endpoint**: `POST /api/skills`

**Request**:
```json
{
  "name": "my-skill",
  "description": "What the skill does",
  "category": "defi",
  "price": 100,
  "tags": ["stacks", "defi"]
}
```

### Purchase Skill

**Endpoint**: `POST /api/skills/:id/buy`

## Skill Categories

- **DeFi**: DEX integrations, yield farming, lending
- **NFT**: NFT trading, minting, analytics
- **Analytics**: Data analysis, reporting
- **Wallet**: Wallet management, transfers
- **Social**: Messaging, Nostr, profiles
- **Infrastructure**: Deployment, monitoring
- **Security**: Signing, verification
- **Identity**: BNS, ERC-8004, reputation
- **Market**: Prediction markets, trading
- **Utility**: General purpose tools

## MCP Tools

```
# Browse all skills
flying_whale_list_skills

# Search DeFi skills
flying_whale_list_skills { "category": "defi", "sort": "popular" }

# Get skill details
flying_whale_get_skill { "skillId": "hodlmm-pulse" }

# List categories
flying_whale_list_categories
```

## Best Practices

### For Skill Creators

1. **Clear Documentation**: Include usage examples
2. **Versioning**: Use semantic versioning
3. **Testing**: Provide test cases
4. **Updates**: Keep skills current

### For Skill Buyers

1. **Check Details**: Review author, arguments, and requirements
2. **Test First**: Use the execution page for usage docs
3. **Report Issues**: Help improve skills by reporting bugs
