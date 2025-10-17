// components/CheckoutForm.tsx
'use client'

import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { useCartStore } from '@/lib/store/cartStore'
import { useState } from 'react'

export default function CheckoutForm({ amount }: { amount: number }) {
  const stripe = useStripe()
  const elements = useElements()
  const { cart, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/success',
      },
      redirect: 'if_required',
    })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    // ✅ Payment success check
    if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        const res = await fetch('/api/createOrder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cart,
            total: amount,
            status: 'PAID', // 👈 we’ll handle this on backend too
          }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Order creation failed')

        clearCart()
        alert('Payment successful! Order created ✅')
      } catch (err: any) {
        alert(err.message)
      }
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button
        disabled={!stripe || loading}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  )
}
