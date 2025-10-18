// /app/api/dashboard/sales/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sales = await db.order.groupBy({
      by: ['createdAt'],
      _sum: { total: true },
      orderBy: { createdAt: 'asc' },
    });

    const formatted = sales.map((s) => ({
      date: s.createdAt.toISOString().split("T")[0],
      total: s._sum.total ?? 0,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error fetching sales data" }, { status: 500 });
  }
}
