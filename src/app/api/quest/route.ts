import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { leaderboard } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (
      !body ||
      typeof body.address !== "string" ||
      body.address.length !== 42
    ) {
      return NextResponse.json({
        error: {
          code: 1,
          message: "Invalid or missing wallet address",
        },
        data: { result: false },
      });
    }

    const walletAddress = body.address.toLowerCase();

    const user = await db.query.leaderboard.findFirst({
      where: eq(leaderboard.walletAddress, walletAddress),
    });

    const hasPlayed = user?.hasPlayedFirstGame ?? false;

    return NextResponse.json({
      error: {
        code: 0,
        message: "",
      },
      data: {
        result: hasPlayed,
      },
    });
  } catch (error) {
    console.error("Check user API error:", error);

    return NextResponse.json({
      error: {
        code: 2,
        message: "Internal server error",
      },
      data: {
        result: false,
      },
    });
  }
}
