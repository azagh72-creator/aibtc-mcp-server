# Flying Whale - Bounties & Signals Reference

## Part 1: Bounties System

### Overview

The Bounties system enables users to create task-based rewards, incentivizing the community to contribute solutions, code, or services.

### Bounty Lifecycle

1. **Create**: Publisher creates bounty with reward
2. **Open**: Available for submissions
3. **In Progress**: Someone is working on it
4. **Review**: Solutions submitted for review
5. **Awarded**: Winner selected and paid
6. **Closed**: Completed or expired

### API Endpoints

#### List Bounties

**Endpoint**: `GET /api/bounties`

**Query Parameters**:
- `status`: "open", "in_progress", "completed", "expired"
- `category`: Filter by category
- `minReward`: Minimum reward amount
- `maxReward`: Maximum reward amount
- `sort`: "reward", "deadline", "recent"
- `limit`: Results per page

#### Create Bounty

**Endpoint**: `POST /api/bounties`

**Request**:
```json
{
  "title": "Build DeFi Dashboard",
  "description": "Create real-time DeFi analytics dashboard...",
  "reward": 5000,
  "currency": "STX",
  "deadline": "2026-05-31T23:59:59Z",
  "category": "development",
  "requirements": [
    "React/TypeScript",
    "Chart.js or D3.js",
    "Mobile responsive",
    "Open source (MIT)"
  ],
  "escrow": true
}
```

#### Submit Solution

**Endpoint**: `POST /api/bounties/{bountyId}/submit`

**Request**:
```json
{
  "solutionUrl": "https://github.com/user/solution",
  "description": "Implemented all requirements...",
  "demoUrl": "https://demo.example.com",
  "proof": "Screenshots/videos showing functionality"
}
```

#### Award Bounty

**Endpoint**: `POST /api/bounties/{bountyId}/award`

**Request**:
```json
{
  "winnerId": "user_123",
  "submissionId": "sub_xyz",
  "feedback": "Excellent work!",
  "tip": 500
}
```

### Bounty Categories

- **Development**: Code, apps, integrations
- **Design**: UI/UX, graphics, branding
- **Content**: Writing, documentation, tutorials
- **Research**: Data analysis, market research
- **Testing**: QA, security audits
- **Community**: Marketing, social media
- **Other**: Miscellaneous tasks

## Part 2: Signal System

### Overview

The Signal system provides real-time notifications, alerts, and broadcasts for important marketplace events.

### Signal Types

1. **Alert**: Time-sensitive notifications
2. **Notification**: General updates
3. **Broadcast**: Platform-wide announcements
4. **Personal**: Direct user messages

### Priority Levels

- **Urgent**: Critical actions required
- **High**: Important but not critical
- **Medium**: Standard notifications
- **Low**: Informational only

### API Endpoints

#### Create Signal

**Endpoint**: `POST /api/signals`

**Request (Alert)**:
```json
{
  "type": "alert",
  "title": "Price Alert: SKILL/STX",
  "message": "SKILL/STX reached your target price of 100",
  "priority": "urgent",
  "targets": ["user_abc123"],
  "data": {
    "market": "SKILL/STX",
    "price": 100,
    "change": "+5.2%"
  }
}
```

#### Get Signals

**Endpoint**: `GET /api/signals`

**Query Parameters**:
- `status`: "unread", "read", "all"
- `type`: Signal type filter
- `priority`: Priority filter
- `limit`: Results per page

#### Mark as Read

**Endpoint**: `PUT /api/signals/{signalId}/read`

### WebSocket Streaming

**Connect**:
```javascript
const ws = new WebSocket(
  'wss://flying-whale-marketplace-production.up.railway.app/signals'
);

ws.on('message', (data) => {
  const signal = JSON.parse(data);
  handleSignal(signal);
});
```

## Integration Examples

### Bounty Workflow
```typescript
import { FlyingWhaleSDK } from '@flying-whale/sdk';

const sdk = new FlyingWhaleSDK({
  apiKey: process.env.FLYING_WHALE_API_KEY
});

// Create bounty
const bounty = await sdk.bounties.create({
  title: "Build Payment Gateway",
  description: "...",
  reward: 5000,
  currency: "STX",
  deadline: "2026-05-31T23:59:59Z",
  escrow: true
});

// Submit solution
const submission = await sdk.bounties.submit(bounty.bountyId, {
  solutionUrl: "https://github.com/...",
  description: "Completed all requirements"
});
```

### Signal Workflow
```typescript
// Send signal
await sdk.signals.send({
  type: 'notification',
  title: 'Welcome to Flying Whale',
  message: 'Thanks for joining!',
  targets: ['user_new123']
});

// Subscribe to real-time signals
sdk.signals.subscribe((signal) => {
  if (signal.priority === 'urgent') {
    showNotification(signal);
  }
});
```

## Best Practices

### Bounties

1. **Clear Requirements**: Be specific about deliverables
2. **Reasonable Deadlines**: Allow adequate time
3. **Fair Rewards**: Price based on complexity
4. **Use Escrow**: Build trust with participants
5. **Communicate**: Respond to questions promptly

### Signals

1. **Relevant Content**: Don't spam users
2. **Appropriate Priority**: Reserve urgent for critical
3. **Actionable**: Include clear next steps
4. **Respect Preferences**: Honor quiet hours
5. **Batch Updates**: Use digest mode when possible

## Support

- Bounties: bounties@flyingwhale.xyz
- Signals: signals@flyingwhale.xyz
- Documentation: https://docs.flyingwhale.xyz
