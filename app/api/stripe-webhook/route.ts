// /app/api/stripe-webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")!;
  const body = await req.text();

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // 💳 Handle successful payment
   if (event.type === "payment_intent.succeeded") {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const cart = JSON.parse(paymentIntent.metadata.cart || "[]");
  const email = paymentIntent.metadata.userEmail;

  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user) return new NextResponse("User not found", { status: 404 });

  await db.order.create({
    data: {
      userId: user.id,
      total: paymentIntent.amount / 100,
      status: "PAID",
      items: {
        create: cart.map((item: any) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
  });
}


    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook Error:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }
}

export const config = {
  api: {
    bodyParser: false, // Required for Stripe to validate the signature
  },
};
