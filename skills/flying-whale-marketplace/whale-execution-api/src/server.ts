// COPYRIGHT 2026 Flying Whale - zaghmout.btc | ERC-8004 #54
// ALL RIGHTS RESERVED — Flying Whale Proprietary License v2.0
// Railway Node.js entry point for whale-execution-api

import { serve } from '@hono/node-server';
import app from './index';

const port = parseInt(process.env.PORT || '3000', 10);

const env = {
  RECIPIENT_ADDRESS: process.env.RECIPIENT_ADDRESS || 'SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW',
  NETWORK: process.env.NETWORK || 'mainnet',
  RELAY_URL: process.env.RELAY_URL || 'https://x402-relay.aibtc.com',
};

serve({
  fetch: (req) => app.fetch(req, env),
  port,
});

console.log(`🐋 Flying Whale Execution API — zaghmout.btc | ERC-8004 #54`);
console.log(`🚀 Listening on port ${port}`);
console.log(`🌐 Network: ${env.NETWORK}`);
console.log(`💳 Recipient: ${env.RECIPIENT_ADDRESS}`);
console.log(`🔗 Relay: ${env.RELAY_URL}`);
console.log(`📡 Endpoints: /api/intelligence/pool | /api/execution/stream | /api/execution/burns | /api/execution/agents | /api/execution/stats | /api/intelligence/premium`);
