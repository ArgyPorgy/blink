/**
 * Client-side x402 payment handler.
 * This module handles the payment flow on the client side using wagmi/viem.
 */

import { parseUnits, type Address } from "viem";
import type { PublicClient, WalletClient } from "viem";
import { PaymentRequirements } from "./x402";

/**
 * Process a payment using x402 protocol.
 * This function handles the USDC transfer on Base.
 * 
 * @param paymentRequirements - Payment requirements from the 402 response
 * @param publicClient - Viem public client for reading
 * @param walletClient - Viem wallet client for signing
 * @returns Transaction hash
 */
export async function handleX402Payment(
  paymentRequirements: PaymentRequirements,
  publicClient: PublicClient,
  walletClient: WalletClient
): Promise<string> {
  // Convert amount to wei (USDC has 6 decimals)
  const amount = parseUnits(paymentRequirements.amount, 6);
  
  // USDC transfer function signature: transfer(address to, uint256 amount)
  // ABI for ERC20 transfer
  const usdcAbi = [
    {
      name: "transfer",
      type: "function",
      stateMutability: "nonpayable",
      inputs: [
        { name: "to", type: "address" },
        { name: "amount", type: "uint256" },
      ],
      outputs: [{ name: "", type: "bool" }],
    },
  ] as const;

  try {
    // Get the account from wallet client
    const [account] = await walletClient.getAddresses();
    if (!account) {
      throw new Error("No account available");
    }

    // Execute the USDC transfer
    const hash = await walletClient.writeContract({
      address: paymentRequirements.token as Address,
      abi: usdcAbi,
      functionName: "transfer",
      args: [paymentRequirements.recipient as Address, amount],
      account,
    });

    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    if (receipt.status === "success") {
      return hash;
    } else {
      throw new Error("Transaction failed");
    }
  } catch (error) {
    console.error("Payment error:", error);
    throw error;
  }
}

