"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { base } from "wagmi/chains";

export default function Home() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const currentChainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const [defaultAmount, setDefaultAmount] = useState("1.0");
  const [tipUrl, setTipUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSwitchChain, setShowSwitchChain] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Fix hydration: only render wallet-dependent UI after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if user is on Base network
  useEffect(() => {
    if (mounted && isConnected && currentChainId && currentChainId !== base.id) {
      setShowSwitchChain(true);
    } else {
      setShowSwitchChain(false);
    }
  }, [mounted, isConnected, currentChainId]);

  const handleSwitchToBase = async () => {
    try {
      await switchChain({ chainId: base.id });
      setShowSwitchChain(false);
    } catch (err) {
      setError(
        err instanceof Error 
          ? err.message 
          : "Failed to switch network. Please switch to Base manually in your wallet."
      );
    }
  };

  const handleConnect = () => {
    if (connectors.length === 0) {
      setError("No wallet connectors available. Please check your configuration.");
      return;
    }
    
    // Try to connect with the first available connector
    // Injected connector (MetaMask) will be first if WalletConnect is not configured
    const connector = connectors[0];
    connect({ connector });
  };

  const handleGenerateTipLink = async () => {
    if (!isConnected || !address) {
      setError("Please connect your wallet first");
      return;
    }

    const amount = parseFloat(defaultAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid tip amount");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/create-tip-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          creatorAddress: address,
          defaultAmount: defaultAmount,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create tip link");
      }

      const data = await response.json();
      setTipUrl(data.tipUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create tip link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">Create Tip Link</h1>

        {/* Wallet Connection */}
        <div className="space-y-2">
          {!mounted || !isConnected ? (
            <div className="space-y-2">
              <button
                onClick={handleConnect}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Connect Wallet
              </button>
              {connectors.length > 0 && (
                <p className="text-xs text-gray-500 text-center">
                  {connectors[0].name === "Injected" 
                    ? "Using browser wallet (MetaMask, etc.)"
                    : `Using ${connectors[0].name}`}
                </p>
              )}
              {connectors.length === 1 && connectors[0].name === "Injected" && (
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                  ⚠️ WalletConnect not configured. Only browser wallets available.
                  <br />
                  Add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID to enable WalletConnect.
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">Connected Address:</p>
                <p className="text-sm font-mono break-all">{address}</p>
                {currentChainId && (
                  <p className="text-xs text-gray-500 mt-1">
                    Network: {currentChainId === base.id ? "Base Mainnet ✓" : `Chain ID ${currentChainId}`}
                  </p>
                )}
              </div>
              
              {/* Switch to Base prompt */}
              {showSwitchChain && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm font-medium text-orange-800 mb-2">
                    ⚠️ Please switch to Base Mainnet
                  </p>
                  <p className="text-xs text-orange-700 mb-2">
                    This app requires Base Mainnet. Please switch your wallet network.
                  </p>
                  <button
                    onClick={handleSwitchToBase}
                    disabled={isSwitching}
                    className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    {isSwitching ? "Switching..." : "Switch to Base Mainnet"}
                  </button>
                </div>
              )}
              
              <button
                onClick={() => disconnect()}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

        {/* Default Tip Amount Input */}
        {mounted && isConnected && (
          <div className="space-y-2">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Default Tip Amount (USDC)
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={defaultAmount}
              onChange={(e) => setDefaultAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1.0"
            />
          </div>
        )}

        {/* Generate Tip Link Button */}
        {mounted && isConnected && !showSwitchChain && (
          <button
            onClick={handleGenerateTipLink}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {loading ? "Generating..." : "Generate Tip Link"}
          </button>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Tip URL Display */}
        {tipUrl && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Your Tip Link:</p>
            <div className="p-3 bg-gray-100 rounded-lg">
              <p className="text-sm font-mono break-all text-blue-600">{tipUrl}</p>
            </div>
            <p className="text-xs text-gray-500">
              Copy this URL and paste it into your Farcaster cast to create an interactive tip frame.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

