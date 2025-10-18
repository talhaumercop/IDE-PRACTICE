import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;

    if (!productId) {
      return NextResponse.json({ error: "Missing productId" }, { status: 400 });
    }

    // ✅ Aggregate the reviews to calculate the average
    const stats = await db.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const average = stats._avg.rating || 0;
    const totalReviews = stats._count.rating || 0;

    // Optional: count distribution per star (e.g., 5★, 4★, etc.)
    const distribution = await db.review.groupBy({
      by: ["rating"],
      where: { productId },
      _count: { rating: true },
    });

    return NextResponse.json({
      average: Number(average.toFixed(1)),
      totalReviews,
      distribution,
    });
  } catch (err) {
    console.error("GET /api/reviews/average error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
