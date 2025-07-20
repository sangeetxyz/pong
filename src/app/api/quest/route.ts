import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { leaderboard } from "@/server/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => null);

    const isValidBody = (body: unknown): body is { address: string } => {
      return (
        typeof body === "object" &&
        body !== null &&
        "address" in body &&
        typeof (body as { address: unknown }).address === "string"
      );
    };

    if (!isValidBody(rawBody) || rawBody.address.length !== 42) {
      return NextResponse.json({
        error: {
          code: 1,
          message: "Invalid or missing wallet address",
        },
        data: { result: false },
      });
    }

    const walletAddress = rawBody.address.toLowerCase();
    const user = await db.query.leaderboard.findFirst({
      where: sql`LOWER(${leaderboard.walletAddress}) = ${walletAddress.toLowerCase()}`,
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
