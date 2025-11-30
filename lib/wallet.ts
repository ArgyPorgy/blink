/**
 * Wallet connection utilities using WalletConnect/Wagmi
 */

import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { createWeb3Modal } from "@web3modal/wagmi";
import { walletConnect, injected } from "wagmi/connectors";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

if (!projectId) {
  console.error(
    "⚠️ NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set!\n" +
    "Get your Project ID from: https://cloud.walletconnect.com\n" +
    "WalletConnect features will not work without a valid Project ID."
  );
}

// Configure chains
const chains = [base] as const;

// Build connectors array
const connectors = [
  // Injected connector (MetaMask, etc.) - works without WalletConnect
  injected(),
];

// Only add WalletConnect if project ID is provided
if (projectId) {
  connectors.push(
    walletConnect({
      projectId,
      showQrModal: true,
    })
  );
}

// Create wagmi config
export const wagmiConfig = createConfig({
  chains,
  connectors,
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://mainnet.base.org"),
  },
});

// Create Web3Modal instance (only if project ID is provided)
// Configure to avoid ChainNotConfiguredError by not syncing profile
export const web3Modal = projectId
  ? createWeb3Modal({
      wagmiConfig,
      projectId,
      chains,
      themeMode: "light",
      enableAccountView: true,
      enableNetworkView: true,
      enableOnramp: false,
      enableEIP6963: true,
      enableCoinbase: false,
      // Disable profile syncing that causes ChainNotConfiguredError
      metadata: {
        name: "Blink - Farcaster Tip Links",
        description: "Generate tip links for Farcaster casts",
        url: typeof window !== "undefined" ? window.location.origin : "",
        icons: [],
      },
    })
  : null;

