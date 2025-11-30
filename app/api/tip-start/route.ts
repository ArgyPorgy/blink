import { NextRequest, NextResponse } from "next/server";
import { getTipConfig } from "@/lib/storage";
import { startTipPayment, processTipPayment } from "@/lib/x402";

/**
 * POST /api/tip-start
 * Initiates a tip payment flow using x402
 * 
 * Body: { tipId: string, tipperAddress: string, amount?: string }
 * Returns: Payment requirements (402) or success response
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tipId, tipperAddress, amount: customAmount, txHash } = body;

    if (!tipId || !tipperAddress) {
      return NextResponse.json(
        { error: "Missing tipId or tipperAddress" },
        { status: 400 }
      );
    }

    // Get tip configuration
    const config = getTipConfig(tipId);
    if (!config) {
      return NextResponse.json(
        { error: "Tip link not found" },
        { status: 404 }
      );
    }

    // Use custom amount if provided, otherwise use default
    const amount = customAmount || config.defaultAmount;

    // If txHash is provided, payment has been completed - verify and process
    if (txHash) {
      const { verifyPayment, processTipPayment } = await import("@/lib/x402");
      
      // Verify payment (in production, this would check on-chain)
      const isValid = await verifyPayment(tipId, txHash);
      
      if (!isValid) {
        return NextResponse.json(
          { error: "Payment verification failed" },
          { status: 400 }
        );
      }

      // Process the tip payment
      const result = await processTipPayment(
        tipId,
        tipperAddress,
        config.creatorAddress,
        amount,
        txHash
      );

      return NextResponse.json({
        status: "success",
        txHash: result.txHash,
        amount,
        message: `Successfully tipped ${amount} USDC`,
      });
    }

    // Start payment flow with x402
    const paymentResponse = await startTipPayment(
      tipId,
      tipperAddress,
      amount,
      config.creatorAddress
    );

    // If payment is required, return 402 status
    if (paymentResponse.status === "payment_required") {
      return NextResponse.json(
        {
          status: "payment_required",
          paymentRequirements: paymentResponse.paymentRequirements,
        },
        { status: 402 }
      );
    }

    // If payment succeeded, process the tip
    if (paymentResponse.status === "success" && paymentResponse.txHash) {
      const result = await processTipPayment(
        tipId,
        tipperAddress,
        config.creatorAddress,
        amount,
        paymentResponse.txHash
      );

      return NextResponse.json({
        status: "success",
        txHash: result.txHash,
        amount,
        message: `Successfully tipped ${amount} USDC`,
      });
    }

    return NextResponse.json(
      { error: "Unexpected payment response" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error starting tip:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

