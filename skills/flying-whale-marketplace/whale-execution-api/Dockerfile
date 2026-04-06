FROM node:20-alpine

# COPYRIGHT 2026 Flying Whale - zaghmout.btc | ERC-8004 #54
# ALL RIGHTS RESERVED — Flying Whale Proprietary License v2.0

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY src/ ./src/

ENV PORT=3000
ENV NETWORK=mainnet
ENV RELAY_URL=https://x402-relay.aibtc.com
ENV RECIPIENT_ADDRESS=SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW

EXPOSE 3000

CMD ["npx", "tsx", "src/server.ts"]
