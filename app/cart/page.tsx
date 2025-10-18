'use client'
import React from 'react'
import { useCartStore } from '@/lib/store/cartStore'
import { useRouter } from 'next/router'
import Link from 'next/link'
// import Checkoutpage from


const CartPage = () => {
  const { cart, removeFromCart, clearCart } = useCartStore()
  const total = cart.reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0)

  if (cart.length === 0) return <h2>Your cart is empty</h2>


  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Your Cart</h1>

      {cart.length === 0 ? (
        <p className="text-gray-500 text-center">Your cart is empty</p>
      ) : (
        <>
          <ul className="space-y-4">
            {cart.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  <p className="text-sm text-gray-600">Price: ${item.price.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="ml-auto px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex justify-between items-center border-t pt-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Total: <span className="text-green-600">${total.toFixed(2)}</span>
            </h3>
            <div className="flex gap-3">
              <button
                onClick={clearCart}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear Cart
              </button>
              <Link
  href={`/checkoutPage?price=${total}`}
  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
>
  Go to Checkout
</Link>

            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default CartPage
