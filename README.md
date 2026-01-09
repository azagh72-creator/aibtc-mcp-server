# stx402-agent

An MCP (Model Context Protocol) server that enables Claude Code to interact with x402 endpoints using your Stacks wallet. The plugin automatically handles x402 payment challenges when accessing paid API endpoints.

## What is x402?

x402 endpoints return HTTP 402 (Payment Required) responses that include payment details. This plugin intercepts those responses, automatically signs and broadcasts the required payment using your Stacks wallet, then retries the request with proof of payment.

## Quick Start

### Option 1: Using npx (Recommended)

Add to Claude Code with a single command:

```bash
claude mcp add stx402 npx stx402-agent -e CLIENT_MNEMONIC="your 24 word mnemonic" -e NETWORK=testnet
```

### Option 2: Global Install

```bash
npm install -g stx402-agent
claude mcp add stx402 stx402-agent -e CLIENT_MNEMONIC="your 24 word mnemonic" -e NETWORK=testnet
```

### Option 3: Manual Configuration

Add to your Claude Code settings (`~/.claude.json`):

```json
{
  "mcpServers": {
    "stx402": {
      "command": "npx",
      "args": ["stx402-agent"],
      "env": {
        "CLIENT_MNEMONIC": "your twenty four word stacks wallet mnemonic phrase goes here",
        "NETWORK": "testnet",
        "API_URL": "https://x402.biwas.xyz"
      }
    }
  }
}
```

After adding, restart Claude Code for the MCP server to load.

## Usage

Once configured, you can ask Claude to use the x402 tools:

**Check your wallet:**
> "What's my wallet address?"

**Check position health (Zest protocol):**
> "Check the health status of my Zest position"

**Execute any x402 endpoint:**
> "Call the /api/zest/position-health endpoint"

## Available Tools

| Tool | Description |
|------|-------------|
| `get_wallet_info` | Returns your configured wallet address and network |
| `check_position_health` | Checks Zest protocol position health for your wallet |
| `execute_x402_endpoint` | Execute any x402 endpoint with automatic payment handling |

## Configuration Options

| Environment Variable | Description | Default |
|---------------------|-------------|---------|
| `CLIENT_MNEMONIC` | Your 24-word Stacks wallet mnemonic | (required) |
| `NETWORK` | `mainnet` or `testnet` | `testnet` |
| `API_URL` | Base URL for x402 endpoints | `https://x402.biwas.xyz` |

## How It Works

```
You → Claude Code → stx402-agent MCP Server
                           ↓
                    Makes API request
                           ↓
                    Receives HTTP 402
                           ↓
                    x402-stacks interceptor:
                    - Parses payment requirements
                    - Signs transaction with your wallet
                    - Broadcasts payment
                    - Retries request with payment proof
                           ↓
                    Returns actual response to Claude
```

## Security Notes

- Your mnemonic is stored in the Claude Code configuration and passed as an environment variable to the MCP server
- The mnemonic never leaves your local machine
- Only use wallets with funds you're willing to spend on x402 payments
- Consider using a dedicated wallet for x402 interactions

## Development

```bash
git clone https://github.com/biwasxyz/stx402-agent.git
cd stx402-agent
npm install
npm run build
npm run dev       # Run with tsx (development)
```

## License

MIT
