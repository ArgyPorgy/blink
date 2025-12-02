# Deployment Guide

This guide will help you deploy Blink to a public URL so that tip links work in Farcaster casts.

## Why Deploy?

Farcaster frames require a publicly accessible URL. Localhost URLs (`http://localhost:3000`) won't work because:
- Farcaster servers can't access your local machine
- Other users can't access your localhost
- Frames need HTTPS in production

## Quick Start: Deploy to Vercel

### Option 1: Using Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? (select your account)
   - Link to existing project? **No**
   - Project name? (press Enter for default)
   - Directory? (press Enter for `./`)
   - Override settings? **No**

4. **Set Environment Variables**:
   ```bash
   vercel env add NEXT_PUBLIC_BASE_CHAIN_ID
   # Enter: 8453
   
   vercel env add NEXT_PUBLIC_BASE_RPC_URL
   # Enter: https://mainnet.base.org
   
   vercel env add NEXT_PUBLIC_USDC_ADDRESS
   # Enter: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
   
   vercel env add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
   # Enter: your_project_id_here
   
   vercel env add NEXT_PUBLIC_BASE_URL
   # Enter: https://your-app-name.vercel.app (use the URL Vercel gave you)
   ```

5. **Redeploy**:
   ```bash
   vercel --prod
   ```

### Option 2: Using Vercel Web Interface

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/blink.git
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Add Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add each variable:
     - `NEXT_PUBLIC_BASE_CHAIN_ID` = `8453`
     - `NEXT_PUBLIC_BASE_RPC_URL` = `https://mainnet.base.org`
     - `NEXT_PUBLIC_USDC_ADDRESS` = `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
     - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` = `your_project_id`
     - `NEXT_PUBLIC_BASE_URL` = `https://your-app.vercel.app` (your Vercel URL)

4. **Deploy**:
   - Vercel will automatically deploy
   - Or click "Redeploy" after adding environment variables

## Alternative Platforms

### Netlify


1. **Connect Repository**:
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository

2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`

3. **Environment Variables**:
   - Go to Site settings → Environment variables
   - Add all `NEXT_PUBLIC_*` variables
   - Set `NEXT_PUBLIC_BASE_URL` to your Netlify URL

4. **Deploy**:
   - Netlify will auto-deploy on push

### Railway

1. **Connect Repository**:
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

2. **Environment Variables**:
   - Go to Variables tab
   - Add all environment variables
   - Set `NEXT_PUBLIC_BASE_URL` to your Railway URL

3. **Deploy**:
   - Railway auto-detects Next.js and deploys

## Testing Your Deployment

1. **Visit your deployed URL** (e.g., `https://your-app.vercel.app`)

2. **Connect Wallet**:
   - Click "Connect Wallet"
   - Make sure you're on Base Mainnet

3. **Generate Tip Link**:
   - Enter a tip amount
   - Click "Generate Tip Link"
   - Copy the URL (should be `https://your-app.vercel.app/frame?tipId=...`)

4. **Test in Farcaster**:
   - Post the tip link in a Farcaster cast
   - The frame should render and be interactive

5. **Test Tip Flow**:
   - Click the tip link in the cast
   - Connect wallet
   - Complete a tip transaction

## Troubleshooting

### Tip links still show localhost
- Check that `NEXT_PUBLIC_BASE_URL` is set correctly in your deployment platform
- Make sure you redeployed after adding the environment variable
- Verify the environment variable is available in production (not just development)

### Wallet connection not working
- Verify `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set
- Check browser console for errors
- Make sure the app is using HTTPS (required for WalletConnect)

### Frames not rendering in Farcaster
- Ensure your URL is publicly accessible
- Check that the frame page loads when accessed directly
- Verify HTTPS is enabled (Farcaster requires HTTPS)

### Build errors
- Make sure all dependencies are in `package.json`
- Check that Node.js version is compatible (18+)
- Review build logs for specific errors

## Next Steps

After deployment:
1. ✅ Test the full flow end-to-end
2. ✅ Share a tip link in a Farcaster cast
3. ✅ Consider adding a database for persistent storage
4. ✅ Set up monitoring and error tracking
5. ✅ Add custom domain (optional)

## Need Help?

- Check the [README.md](./README.md) for more details
- Review Next.js deployment docs: https://nextjs.org/docs/deployment
- Vercel docs: https://vercel.com/docs

