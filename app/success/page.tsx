// /app/success/page.tsx
"use client";
import { useEffect } from "react";
import { useCartStore } from "@/lib/store/cartStore";

export default function SuccessPage() {
  const { cart, clearCart } = useCartStore();

  useEffect(() => {
    const createOrder = async () => {
      await fetch("/api/createOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, total: cart.reduce((a, i) => a + i.price * i.quantity!, 0) }),
      });
      clearCart();
    };

    createOrder();
  }, [cart, clearCart]);

  return <h1>✅ Payment successful — order created!</h1>;
}
