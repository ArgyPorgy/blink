import { NextRequest, NextResponse } from "next/server";
import { getTipConfig } from "@/lib/storage";

/**
 * GET /api/tip-metadata?tipId=...
 * Fetches metadata for a tip link
 * 
 * Returns: { tipId: string, creatorAddress: string, defaultAmount: string }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipId = searchParams.get("tipId");

    if (!tipId) {
      return NextResponse.json(
        { error: "Missing tipId parameter" },
        { status: 400 }
      );
    }

    const config = getTipConfig(tipId);

    if (!config) {
      return NextResponse.json(
        { error: "Tip link not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      tipId: config.tipId,
      creatorAddress: config.creatorAddress,
      defaultAmount: config.defaultAmount,
    });
  } catch (error) {
    console.error("Error fetching tip metadata:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

