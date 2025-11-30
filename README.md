# Blink - Farcaster Tip Links

A minimal full-stack TypeScript app for creating interactive tip links in Farcaster casts. Users can generate tip links that render as interactive frames where others can tip USDC to creators using x402 on Base.

## Features

- **Creator Flow**: Connect wallet, set default tip amount, generate tip links
- **Tipper Flow**: Interactive frame for tipping USDC via x402 protocol
- **Wallet Integration**: WalletConnect for EVM wallet connection
- **x402 Payment Flow**: Handles 402 Payment Required responses with automatic payment processing
- **Base Chain**: Built for Base network with USDC support

## Tech Stack

- **Next.js 14** (App Router) with TypeScript
- **TailwindCSS** for styling
- **WalletConnect** + **Wagmi** + **Viem** for wallet connection
- **x402** protocol for payment flows
- **Base** chain + USDC token

## Setup

### Prerequisites

- Node.js 18+ and npm/yarn
- WalletConnect Project ID (get from [WalletConnect Cloud](https://cloud.walletconnect.com))

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory:
```bash
cp .env.local.example .env.local
```

3. Configure environment variables in `.env.local`:
```env
# Base chain configuration
NEXT_PUBLIC_BASE_CHAIN_ID=8453
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org

# USDC token address on Base
NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

# WalletConnect Project ID (required)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Base URL for generating tip links
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Creator Flow

1. Visit the root page (`/`)
2. Click "Connect Wallet" and connect your EVM wallet
3. Enter a default tip amount in USDC
4. Click "Generate Tip Link"
5. Copy the generated tip link URL
6. Paste the URL into a Farcaster cast to create an interactive tip frame

### Tipper Flow

1. Click on a tip link in a Farcaster cast (or visit `/frame?tipId=...`)
2. The frame will display the tip amount
3. Connect your wallet
4. Click "Tip X USDC" button
5. Approve the transaction in your wallet
6. Wait for confirmation
7. See success message with transaction hash

## API Endpoints

### `POST /api/create-tip-link`

Creates a new tip link configuration.

**Request Body:**
```json
{
  "creatorAddress": "0x...",
  "defaultAmount": "1.0"
}
```

**Response:**
```json
{
  "tipId": "tip_...",
  "tipUrl": "http://localhost:3000/frame?tipId=..."
}
```

### `GET /api/tip-metadata?tipId=...`

Fetches metadata for a tip link.

**Response:**
```json
{
  "tipId": "tip_...",
  "creatorAddress": "0x...",
  "defaultAmount": "1.0"
}
```

### `POST /api/tip-start`

Initiates a tip payment flow using x402.

**Request Body:**
```json
{
  "tipId": "tip_...",
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

## x402 Integration

The app implements the x402 protocol for handling payments:

1. **Initial Request**: Client calls `/api/tip-start` without payment
2. **402 Response**: Server returns 402 with payment requirements
3. **Payment Processing**: Client uses x402 client to process USDC transfer
4. **Retry Request**: Client retries `/api/tip-start` with transaction hash
5. **Success**: Server verifies payment and returns success response

The x402 integration is implemented in:
- `lib/x402.ts` - Server-side payment flow logic
- `lib/x402-client.ts` - Client-side payment processing

## Project Structure

```
blink/
├── app/
│   ├── api/
│   │   ├── create-tip-link/route.ts    # Create tip link endpoint
│   │   ├── tip-metadata/route.ts       # Get tip metadata endpoint
│   │   └── tip-start/route.ts          # Start tip payment endpoint
│   ├── frame/
│   │   └── page.tsx                    # Tipper frame page
│   ├── globals.css                     # Global styles
│   ├── layout.tsx                      # Root layout with WalletProvider
│   └── page.tsx                        # Creator page
├── components/
│   └── WalletProvider.tsx              # Wallet context provider
├── lib/
│   ├── storage.ts                      # In-memory tip storage
│   ├── wallet.ts                       # Wallet configuration
│   ├── x402.ts                         # x402 server-side logic
│   └── x402-client.ts                  # x402 client-side payment handler
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

## Storage

Currently uses in-memory storage for tip configurations. In production, this should be replaced with a database (e.g., PostgreSQL, MongoDB, or Supabase).

## Development

- Run dev server: `npm run dev`
- Build for production: `npm run build`
- Start production server: `npm start`
- Lint: `npm run lint`

## Deployment

### Deploy to Vercel (Recommended)

Vercel is the easiest way to deploy Next.js apps:

1. **Install Vercel CLI** (optional, or use web interface):
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```
   Or push to GitHub and import your repo at [vercel.com](https://vercel.com)

3. **Set Environment Variables** in Vercel Dashboard:
   - Go to your project → Settings → Environment Variables
   - Add all variables from `.env.local`:
     ```
     NEXT_PUBLIC_BASE_CHAIN_ID=8453
     NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
     NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
     NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
     NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
     ```
   - **Important**: Set `NEXT_PUBLIC_BASE_URL` to your Vercel deployment URL (e.g., `https://blink.vercel.app`)

4. **Redeploy** after adding environment variables

### Deploy to Other Platforms

#### Netlify
1. Connect your GitHub repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add environment variables in Netlify dashboard
5. Set `NEXT_PUBLIC_BASE_URL` to your Netlify URL

#### Railway
1. Connect your GitHub repo to Railway
2. Railway auto-detects Next.js
3. Add environment variables in Railway dashboard
4. Set `NEXT_PUBLIC_BASE_URL` to your Railway URL

#### Self-Hosted
1. Build the app: `npm run build`
2. Start production server: `npm start`
3. Set `NEXT_PUBLIC_BASE_URL` to your domain
4. Use a reverse proxy (nginx) for HTTPS

### Post-Deployment Checklist

- [ ] Set `NEXT_PUBLIC_BASE_URL` to your production URL
- [ ] Verify all environment variables are set
- [ ] Test wallet connection on production
- [ ] Generate a tip link and verify it works
- [ ] Test the tip flow end-to-end
- [ ] Share a tip link in a Farcaster cast to test embedding

### Important Notes

- **Localhost URLs won't work** in Farcaster casts - you must deploy to a public URL
- The app uses in-memory storage, so tip configs are lost on server restart
- For production, consider adding a database (PostgreSQL, MongoDB, or Supabase)
- Make sure your deployment URL is accessible from the public internet

## Notes

- The app is configured for Base mainnet. To use testnet, update the chain ID and USDC address in `.env.local`
- USDC on Base has 6 decimals
- WalletConnect Project ID is required for wallet connections
- Tip configurations are stored in memory and will be lost on server restart
- **For Farcaster frames to work, the app must be deployed to a public URL (not localhost)**

## License

See LICENSE file for details.
