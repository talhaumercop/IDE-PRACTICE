'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

const OrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)
  const router = useRouter()
  const { data: session, status } = useSession()

  const emailOfOwner = (session?.user as any)?.email as string | undefined
  const isAdmin = emailOfOwner === process.env.NEXT_PUBLIC_ADMIN_EMAIL

  useEffect(() => {
    if (status !== 'authenticated') return
    const fetchOrders = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/getOrders')
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || 'Failed to fetch orders')
        setOrders(data)
      } catch (err: any) {
        console.error(err)
        if (err.message.toLowerCase().includes('unauthorized')) {
          router.push('/api/auth/signin')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [router, status])

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      setUpdating(orderId)
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to update order')

      // Update UI instantly after success
      setOrders((prev) => prev.map((o) => (o.id === orderId ? data : o)))
    } catch (err) {
      console.error(err)
      alert('Failed to update order status')
    } finally {
      setUpdating(null)
    }
  }

  if (loading || status === 'loading') return <p>Loading...</p>
  if (!orders || orders.length === 0) return <p>No orders yet.</p>

  // Function to return banner color based on order status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#facc15'  // yellow
      case 'PAID': return '#4ade80'     // green
      case 'SHIPPED': return '#60a5fa'  // blue
      case 'DELIVERED': return '#22c55e'// dark green
      case 'CANCELLED': return '#ef4444'// red
      default: return '#e5e7eb'         // gray
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Orders</h1>
      {orders.map((order) => (
        <div
          key={order.id}
          style={{
            position: 'relative',
            border: '1px solid #ddd',
            padding: 16,
            marginBottom: 16,
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          {/* ✅ STATUS BANNER ON TOP */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              backgroundColor: getStatusColor(order.status),
              color: '#fff',
              textAlign: 'center',
              fontWeight: 'bold',
              padding: '4px 0',
            }}
          >
            {order.status}
          </div>

          {/* MAIN CONTENT */}
          <div style={{ marginTop: 30 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <strong>Order ID:</strong> {order.id}<br />
                <strong>Created:</strong> {new Date(order.createdAt).toLocaleString()}
              </div>

              {order.user && (
                <div style={{ textAlign: 'right' }}>
                  <strong>Customer:</strong><br />
                  {order.user.name ?? order.user.email}<br />
                  <small>{order.user.email}</small>
                </div>
              )}
            </div>

            <div style={{ marginTop: 8 }}>
              <strong>Items:</strong>
              <ul>
                {order.items.map((item: any) => (
                  <li key={item.id}>
                    {item.product?.name ?? item.productId} × {item.quantity} — $
                    {item.price?.toFixed(2) ?? '0.00'}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <strong>Total:</strong> ${order.total?.toFixed(2) ?? '0.00'}
            </div>

            {/* Admin buttons visible only for owner */}
            {isAdmin && (
              <div style={{ marginTop: 10 }}>
                <p><strong>Update Status:</strong></p>
                {['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
                  <button
                    key={status}
                    onClick={() => updateOrderStatus(order.id, status)}
                    disabled={updating === order.id}
                    style={{
                      marginRight: 8,
                      padding: '4px 10px',
                      background: getStatusColor(status),
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      cursor: updating === order.id ? 'not-allowed' : 'pointer',
                      opacity: updating === order.id ? 0.6 : 1,
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default OrdersPage
//men grabbed her neck and hairs tightly and start to kiss her lips non stop seductively with moaning ,without her consent