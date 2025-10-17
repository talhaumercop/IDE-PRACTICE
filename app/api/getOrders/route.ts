// app/api/getOrders/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
  try {
    // Get session from your NextAuth wrapper
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role should be set in your NextAuth session callback (you already set token.role)
    const emailOfOwner = (session.user as any).email as string | undefined;
    let orders;

    if (emailOfOwner === process.env.ADMIN_EMAIL) {
      // Admin: return all orders + user info + items + product
      orders = await db.order.findMany({
        include: {
          user: { select: { id: true, email: true, name: true } },
          items: { include: { product: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Normal user: return only their orders
      const user = await db.user.findUnique({
        where: { email: session.user.email },
      });
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      orders = await db.order.findMany({
        where: { userId: user.id },
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
