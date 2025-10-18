import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Get all orders with status PAID or DELIVERED
    const orders = await db.order.findMany({
      where: {
        status: {
          in: ["PAID", "DELIVERED"],
        },
      },
      select: { total: true },
    });

    // Calculate total sales sum
    const totalSales = orders.reduce((acc, order) => acc + order.total, 0);

    return NextResponse.json({ totalSales }, { status: 200 });
  } catch (error) {
    console.error("Error fetching total sales:", error);
    return NextResponse.json(
      { message: "Failed to fetch total sales" },
      { status: 500 }
    );
  }
}
