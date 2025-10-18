import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const averages = await db.review.groupBy({
      by: ["productId"],
      _avg: { rating: true },
    });

    return NextResponse.json(averages);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch average ratings" }, { status: 500 });
  }
}
