import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function PATCH(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the user making the request
    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only admins can update orders
       const email = (session.user as any).email as string | undefined;

    if (email !== process.env.ADMIN_EMAIL) {
        console.log('not allowed', email)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { orderId } = params;
    const { status } = await req.json();

    // Validate input
    const allowedStatuses = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Check if order exists
    const existingOrder = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update order status
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: { include: { product: true } },
        user: true,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (err) {
    console.error("Error updating order status:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
