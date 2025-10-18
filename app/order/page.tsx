'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

const CustomerOrdersPage = () => {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status !== 'authenticated') return
    const fetchOrders = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/getCustomerOrders')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load orders')
        setOrders(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [status])

  if (loading) return <p>Loading...</p>
  if (orders.length === 0) return <p>No orders found.</p>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Your Orders</h1>
      <div className="grid gap-4">
        {orders.map((order) => (
          <div key={order.id} className="border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">Order #{order.id}</p>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded text-white text-sm ${
                  order.status === 'PENDING'
                    ? 'bg-yellow-500'
                    : order.status === 'PAID'
                    ? 'bg-green-500'
                    : order.status === 'SHIPPED'
                    ? 'bg-blue-500'
                    : order.status === 'DELIVERED'
                    ? 'bg-emerald-600'
                    : 'bg-red-500'
                }`}
              >
                {order.status}
              </span>
            </div>
            <ul className="mt-3 text-sm text-gray-700">
              {order.items.map((item: any) => (
                <li key={item.id}>
                  {item.product?.name} × {item.quantity} — ${item.price}
                </li>
              ))}
            </ul>
            <div className="mt-2 font-semibold">Total: ${order.total}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CustomerOrdersPage
