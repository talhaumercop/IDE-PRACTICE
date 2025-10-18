import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '5')
    const skip = (page - 1) * limit

    const session = await auth()
    if (!session?.user?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    if (session.user.email !== process.env.ADMIN_EMAIL)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const totalOrders = await db.order.count()
    const orders = await db.order.findMany({
      include: {
        items: { include: { product: true } },
        user: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    })

    const totalPages = Math.ceil(totalOrders / limit)
    return NextResponse.json({ orders, totalPages })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
