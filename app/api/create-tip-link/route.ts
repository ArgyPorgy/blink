import { NextRequest, NextResponse } from "next/server";
import { createTipConfig } from "@/lib/storage";

/**
 * POST /api/create-tip-link
 * Creates a new tip link configuration
 * 
 * Body: { creatorAddress: string, defaultAmount: string }
 * Returns: { tipId: string, tipUrl: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { creatorAddress, defaultAmount } = body;

    if (!creatorAddress || !defaultAmount) {
      return NextResponse.json(
        { error: "Missing creatorAddress or defaultAmount" },
        { status: 400 }
      );
    }

    // Validate amount is a positive number
    const amount = parseFloat(defaultAmount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "defaultAmount must be a positive number" },
        { status: 400 }
      );
    }

    // Create tip configuration
    const config = createTipConfig(creatorAddress, defaultAmount);

    // Generate tip URL
    // Try to get base URL from environment, request headers, or fallback to localhost
    const host = request.headers.get("host");
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const baseUrl = 
      process.env.NEXT_PUBLIC_BASE_URL || 
      (host ? `${protocol}://${host}` : null) ||
      "http://localhost:3000";
    const tipUrl = `${baseUrl}/frame?tipId=${config.tipId}`;

    return NextResponse.json({
      tipId: config.tipId,
      tipUrl,
    });
  } catch (error) {
    console.error("Error creating tip link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

