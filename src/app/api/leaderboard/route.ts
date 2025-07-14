import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { leaderboard } from "@/server/db/schema";
import { desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const walletAddress = searchParams.get("walletAddress");

  try {
    const allEntries = await db
      .select()
      .from(leaderboard)
      .orderBy(desc(leaderboard.pongTokenCount));

    if (walletAddress) {
      const index = allEntries.findIndex(
        (entry) => entry.walletAddress === walletAddress,
      );

      if (index === -1) {
        return NextResponse.json([]);
      }

      const entry = allEntries[index];

      if (!entry) return NextResponse.json([]);

      return NextResponse.json([
        {
          rank: index + 1,
          score: entry.pongTokenCount,
          walletAddress: entry.walletAddress,
        },
      ]);
    }

    const top10 = allEntries.slice(0, 10).map((entry, index) => ({
      rank: index + 1,
      score: entry.pongTokenCount,
      walletAddress: entry.walletAddress,
    }));

    return NextResponse.json(top10);
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
