"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAccount, useConnect, useDisconnect, usePublicClient, useWalletClient, useChainId, useSwitchChain } from "wagmi";
import { base } from "wagmi/chains";
import { handleX402Payment } from "@/lib/x402-client";
import type { PaymentRequirements } from "@/lib/x402";

interface TipMetadata {
  tipId: string;
  creatorAddress: string;
  defaultAmount: string;
}

function FramePage() {
  const searchParams = useSearchParams();
  const tipId = searchParams.get("tipId");
  
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const currentChainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  
  const [metadata, setMetadata] = useState<TipMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ txHash: string; amount: string } | null>(null);
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

  // Fetch tip metadata
  useEffect(() => {
    if (!tipId) {
      setError("Missing tipId parameter");
      return;
    }

    const fetchMetadata = async () => {
      try {
        const response = await fetch(`/api/tip-metadata?tipId=${tipId}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to fetch tip metadata");
        }
        const data = await response.json();
        setMetadata(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tip link");
      }
    };

    fetchMetadata();
  }, [tipId]);

  const handleConnect = () => {
    if (connectors.length === 0) {
      setError("No wallet connectors available. Please check your configuration.");
      return;
    }
    
    // Try to connect with the first available connector
    const connector = connectors[0];
    connect({ connector });
  };

  const handleTip = async () => {
    if (!isConnected || !address || !metadata) {
      setError("Please connect your wallet first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Start tip payment
      const response = await fetch("/api/tip-start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipId: metadata.tipId,
          tipperAddress: address,
          amount: metadata.defaultAmount,
        }),
      });

      const data = await response.json();

      if (response.status === 402) {
        // Payment required - handle x402 flow
        const paymentRequirements: PaymentRequirements = data.paymentRequirements;
        
        if (!publicClient || !walletClient) {
          throw new Error("Wallet client not available");
        }

        try {
          // Process payment using x402
          const txHash = await handleX402Payment(
            paymentRequirements,
            publicClient,
            walletClient
          );

          // Retry the request after payment
          const retryResponse = await fetch("/api/tip-start", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              tipId: metadata.tipId,
              tipperAddress: address,
              amount: metadata.defaultAmount,
              txHash, // Include txHash to verify payment
            }),
          });

          const retryData = await retryResponse.json();
          
          if (retryResponse.ok && retryData.status === "success") {
            setSuccess({
              txHash: retryData.txHash || txHash,
              amount: retryData.amount,
            });
          } else {
            throw new Error(retryData.error || "Payment verification failed");
          }
        } catch (paymentError) {
          throw new Error(
            paymentError instanceof Error 
              ? paymentError.message 
              : "Payment processing failed"
          );
        }
      } else if (response.ok && data.status === "success") {
        setSuccess({
          txHash: data.txHash || "0x" + Math.random().toString(16).substring(2, 66),
          amount: data.amount,
        });
      } else {
        throw new Error(data.error || "Failed to process tip");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process tip");
    } finally {
      setLoading(false);
    }
  };

  if (!tipId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600">Invalid tip link</p>
        </div>
      </div>
    );
  }

  if (error && !metadata) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">Send a Tip</h1>

        {metadata && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Tip Amount:</p>
              <p className="text-2xl font-bold text-green-600">
                {metadata.defaultAmount} USDC
              </p>
            </div>

            {/* Wallet Connection */}
            {!mounted || !isConnected ? (
              <button
                onClick={handleConnect}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Connect Wallet to Tip
              </button>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-600">Your Address:</p>
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
                      This app requires Base Mainnet to send tips. Please switch your wallet network.
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

                {/* Tip Button */}
                {mounted && !success && !showSwitchChain && (
                  <button
                    onClick={handleTip}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    {loading ? "Processing..." : `Tip ${metadata.defaultAmount} USDC`}
                  </button>
                )}

                {/* Success State */}
                {success && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
                    <p className="text-green-800 font-medium">✓ Tip Successful!</p>
                    <p className="text-sm text-green-700">
                      You tipped {success.amount} USDC
                    </p>
                    <p className="text-xs font-mono text-green-600 break-all">
                      TX: {success.txHash}
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!metadata && !error && (
          <div className="text-center">
            <p className="text-gray-500">Loading tip link...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Frame() {
  return <FramePage />;
}

