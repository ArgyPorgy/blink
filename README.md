# 💸 Blink - Farcaster Tip Links

> Create interactive tip links for Farcaster casts. Let your audience tip you USDC on Base with a single click.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Base](https://img.shields.io/badge/Base-Mainnet-blue)](https://base.org/)

**Blink** is a minimal full-stack application that enables creators to generate shareable tip links. When posted in a Farcaster cast, these links render as interactive frames where followers can tip USDC directly to the creator using the x402 payment protocol on Base.

## ✨ Features

- 🎯 **Simple Creator Flow** - Connect wallet, set amount, generate link
- 💰 **One-Click Tipping** - Interactive frames for seamless USDC tips
- 🔗 **Farcaster Native** - Tip links render beautifully in casts
- 🔐 **WalletConnect Integration** - Support for all major wallets
- ⚡ **x402 Protocol** - Modern payment flow with 402 Payment Required
- 🌐 **Base Network** - Built for Base mainnet with USDC support
- 🎨 **Clean UI** - Modern, responsive design with TailwindCSS

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **WalletConnect Project ID** - Get one free at [WalletConnect Cloud](https://cloud.walletconnect.com)
- **Base Network Wallet** - MetaMask or any EVM wallet with Base network

### Installation

1. **Clone and install**:
   ```bash
   git clone <your-repo-url>
   cd blink
   npm install
   ```

2. **Configure environment variables**:
   
   Create a `.env.local` file in the root directory:
   ```env
   # Base Chain Configuration
   NEXT_PUBLIC_BASE_CHAIN_ID=8453
   NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
   
   # USDC Token Address (Base Mainnet)
   NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
   
   # WalletConnect (Required for wallet connections)
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
   
   # Base URL (for localhost, use http://localhost:3000)
   # For production, set to your deployed URL
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open** [http://localhost:3000](http://localhost:3000) in your browser

## 📖 How It Works

### For Creators

1. **Visit** the app and connect your wallet (must be on Base network)
2. **Enter** your desired tip amount in USDC
3. **Generate** a tip link
4. **Share** the link in your Farcaster cast
5. The link automatically renders as an interactive frame

### For Tippers

1. **Click** a tip link in a Farcaster cast
2. **Connect** your wallet (auto-prompted to switch to Base if needed)
3. **Review** the tip amount
4. **Click** "Tip X USDC" and approve the transaction
5. **Confirm** success with transaction hash

## 🏗️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **TailwindCSS** | Utility-first styling |
| **Wagmi** | React hooks for Ethereum |
| **Viem** | TypeScript Ethereum library |
| **WalletConnect** | Multi-wallet connection |
| **x402 Protocol** | HTTP 402 Payment Required flow |
| **Base** | Layer 2 blockchain network |

## 📁 Project Structure

```
blink/
├── app/
│   ├── api/                    # API routes
│   │   ├── create-tip-link/    # Generate new tip links
│   │   ├── tip-metadata/       # Fetch tip configuration
│   │   └── tip-start/          # Initiate payment flow
│   ├── frame/                  # Tipper interface
│   │   └── page.tsx
│   ├── page.tsx                # Creator interface
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
├── components/
│   └── WalletProvider.tsx      # Wallet context
├── lib/
│   ├── storage.ts              # In-memory tip storage
│   ├── wallet.ts               # Wallet configuration
│   ├── x402.ts                 # Server-side x402 logic
│   └── x402-client.ts          # Client-side payment handler
└── [config files]
```

## 🔌 API Reference

### `POST /api/create-tip-link`

Creates a new tip link configuration.

**Request:**
```json
{
  "creatorAddress": "0x...",
  "defaultAmount": "1.0"
}
```

**Response:**
```json
{
  "tipId": "tip_1234567890_abc123",
  "tipUrl": "https://your-app.com/frame?tipId=tip_1234567890_abc123"
}
```

### `GET /api/tip-metadata?tipId=...`

Retrieves tip link metadata.

**Response:**
```json
{
  "tipId": "tip_1234567890_abc123",
  "creatorAddress": "0x...",
  "defaultAmount": "1.0"
}
```

### `POST /api/tip-start`

Initiates the x402 payment flow.

**Request:**
```json
{
  "tipId": "tip_1234567890_abc123",
  "tipperAddress": "0x...",
  "amount": "1.0"
}
```

**Response (402 Payment Required):**
```json
{
  "status": "payment_required",
  "paymentRequirements": {
    "amount": "1.0",
    "token": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "recipient": "0x...",
    "chainId": 8453
  }
}
```

**Response (Success):**
```json
{
  "status": "success",
  "txHash": "0x...",
  "amount": "1.0",
  "message": "Successfully tipped 1.0 USDC"
}
```

## 🔄 x402 Payment Flow

Blink implements the x402 protocol for seamless payments:

1. **Initial Request** → Client requests tip without payment
2. **402 Response** → Server returns payment requirements
3. **Payment Processing** → Client executes USDC transfer on Base
4. **Retry Request** → Client retries with transaction hash
5. **Success** → Server verifies and confirms payment

This flow ensures payments are atomic and verifiable on-chain.

## 🚢 Deployment

> **⚠️ Important**: Localhost URLs won't work in Farcaster casts. You must deploy to a public URL.

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Set Environment Variables** in Vercel Dashboard:
   - Go to Project → Settings → Environment Variables
   - Add all variables from your `.env.local`
   - **Critical**: Set `NEXT_PUBLIC_BASE_URL` to your Vercel URL

4. **Redeploy**:
   ```bash
   vercel --prod
   ```

📚 **Detailed deployment guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)

### Other Platforms

- **Netlify**: Connect repo, set build command to `npm run build`, add env vars
- **Railway**: Auto-detects Next.js, add env vars in dashboard
- **Self-hosted**: Build with `npm run build`, start with `npm start`, configure reverse proxy

## 🛠️ Development

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_BASE_CHAIN_ID` | Base network chain ID | No | `8453` |
| `NEXT_PUBLIC_BASE_RPC_URL` | Base RPC endpoint | No | `https://mainnet.base.org` |
| `NEXT_PUBLIC_USDC_ADDRESS` | USDC token contract | No | Base mainnet address |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID | Yes* | - |
| `NEXT_PUBLIC_BASE_URL` | App base URL | No | Auto-detected |

*WalletConnect is optional - browser wallets (MetaMask) work without it

### Network Configuration

The app is configured for **Base Mainnet** by default. To use Base Sepolia testnet:

```env
NEXT_PUBLIC_BASE_CHAIN_ID=84532
NEXT_PUBLIC_BASE_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_USDC_ADDRESS=<testnet_usdc_address>
```

## 📝 Important Notes

- **Storage**: Currently uses in-memory storage. Tip configs are lost on server restart. For production, consider adding a database (PostgreSQL, MongoDB, Supabase).
- **USDC Decimals**: USDC on Base uses 6 decimals (not 18 like ETH).
- **Network Switching**: The app automatically prompts users to switch to Base if they're on a different network.
- **HTTPS Required**: Production deployments must use HTTPS for WalletConnect to work.
- **Farcaster Frames**: Tip links must be deployed to a public URL to work in Farcaster casts.

## 🐛 Troubleshooting

### Wallet Connection Issues

- **Error: "Unauthorized: invalid key"** → Check `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set correctly
- **Wallet not connecting** → Ensure you're using HTTPS in production
- **Wrong network** → App will prompt to switch to Base automatically

### Tip Link Issues

- **Localhost URL generated** → Set `NEXT_PUBLIC_BASE_URL` in production
- **Frame not rendering** → Ensure URL is publicly accessible and uses HTTPS
- **Tip link not found** → Tip configs are in-memory; may be lost on restart

### Build Errors

- **Module resolution errors** → Run `npm install` to ensure all dependencies are installed
- **Type errors** → Check TypeScript version matches project requirements

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

See [LICENSE](./LICENSE) file for details.

## 🔗 Links

- [Base Network](https://base.org)
- [Farcaster](https://farcaster.xyz)
- [WalletConnect](https://walletconnect.com)
- [Next.js Documentation](https://nextjs.org/docs)

---

**Made with ❤️ for the Farcaster community**
