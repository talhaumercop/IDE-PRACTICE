'use client'

import { useEffect, useState } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { useSearchParams } from 'next/navigation'
import CheckoutForm from '@/components/CheckoutForm'
import convertToSubcurrency from '@/lib/convertToSubcurrency'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!)

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const price = parseFloat(searchParams.get('price') || '0') // 👈 Get price from URL
  const amount = price || 0 // fallback to 0 if price not found

  useEffect(() => {
    if (!amount || isNaN(amount)) return // prevent invalid request

    const createPaymentIntent = async () => {
      try {
        const res = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: convertToSubcurrency(amount) }),
        })

        if (!res.ok) throw new Error('Failed to create payment intent')

        const data = await res.json()
        setClientSecret(data.clientSecret)
      } catch (error) {
        console.error('Payment Intent Error:', error)
      }
    }

    createPaymentIntent()
  }, [amount])

  if (!clientSecret) return <p>Loading checkout...</p>

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <p className="text-lg mb-6">Total amount: ${amount.toFixed(2)}</p>

      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: { theme: 'stripe' },
        }}
      >
        <CheckoutForm amount={amount} />
      </Elements>
    </div>
  )
}
