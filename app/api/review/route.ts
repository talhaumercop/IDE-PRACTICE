// app/api/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

function jsonError(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export async function POST(req: NextRequest) {
  try {
    // AUTH: get session via your auth() wrapper
    const session = await auth();
    if (!session?.user?.email) return jsonError("Not authenticated", 401);

    // Resolve actual DB user (don't trust session.user.id unless you added it)
    const user = await db.user.findUnique({ where: { email: session.user.email } });
    if (!user) return jsonError("Authenticated user not found in DB", 401);

    const body = await req.json();
    const { productId, rating, comment } = body ?? {};

    if (!productId) return jsonError("Missing productId", 400);
    if (rating === undefined || rating === null) return jsonError("Missing rating", 400);

    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return jsonError("Rating must be an integer between 1 and 5", 400);
    }

    // Check product exists
    const product = await db.products.findUnique({ where: { id: productId } });
    if (!product) return jsonError("Product not found", 404);

    // Optional: prevent duplicate reviews by same user (business rule)
    const existing = await db.review.findFirst({
      where: { userId: user.id, productId },
    });
    if (existing) return jsonError("You already reviewed this product", 400);

    const review = await db.review.create({
      data: {
        userId: user.id,
        productId,
        rating: ratingNum,
        comment: comment ?? "",
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (err: any) {
    // Verbose logging for dev. In production you might log to an error tracker.
    console.error("POST /api/reviews error:", err);
    const message = err?.message ?? "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    if (!productId) return jsonError("Missing productId", 400);

    const reviews = await db.review.findMany({
      where: { productId },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews);
  } catch (err: any) {
    console.error("GET /api/reviews error:", err);
    return NextResponse.json({ error: err?.message ?? "Internal server error" }, { status: 500 });
  }
}
