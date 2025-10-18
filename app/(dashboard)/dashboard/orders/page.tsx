'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog'
import { toast } from "sonner";

const AdminOrdersPage = () => {
  const { data: session, status } = useSession()

  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)
  const [pendingStatus, setPendingStatus] = useState<{ orderId: string, newStatus: string } | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 5

  const isAdmin = (session?.user as any)?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL

  useEffect(() => {
    if (!isAdmin || status !== 'authenticated') return
    const fetchOrders = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/adminOrders?page=${page}&limit=${limit}`)
        const data = await res.json()
        setOrders(data.orders)
        setTotalPages(data.totalPages)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [page, status, isAdmin])

  const handleConfirmStatusChange = async () => {
    if (!pendingStatus) return
    const { orderId, newStatus } = pendingStatus
    setUpdating(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOrders(prev => prev.map(o => (o.id === orderId ? data : o)))
      toast.success("Order Updated", { description: `Status changed to ${newStatus}` })
    } catch (err) {
      console.error(err)
      toast.error("Update Failed", { description: 'Could not update order status' })
    } finally {
      setUpdating(null)
      setPendingStatus(null)
    }
  }

  if (!isAdmin) return <p>Access Denied.</p>
  if (loading) return <p>Loading...</p>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">All Orders</h1>
      <div className="grid gap-4">
        {orders.map(order => (
          <Card key={order.id}>
            <CardHeader>
              <CardTitle>Order #{order.id}</CardTitle>
              <p className="text-sm text-gray-500">{order.user?.name ?? order.user?.email}</p>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Status: {order.status}</span>

                <Select
                  onValueChange={val => setPendingStatus({ orderId: order.id, newStatus: val })}
                  disabled={updating === order.id}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Change status" />
                  </SelectTrigger>
                  <SelectContent>
                    {['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']
                      .filter(s => s !== order.status)
                      .map(status => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <ul className="text-sm text-gray-700 mb-2">
                {order.items.map((item: any) => (
                  <li key={item.id}>
                    {item.product?.name} × {item.quantity} — ${item.price}
                  </li>
                ))}
              </ul>
              <div className="font-semibold">Total: ${order.total}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center mt-4 gap-2">
        <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
          Previous
        </Button>
        <span className="text-sm font-medium">
          Page {page} of {totalPages}
        </span>
        <Button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
          Next
        </Button>
      </div>

      {/* CONFIRMATION POPUP */}
      <AlertDialog open={!!pendingStatus} onOpenChange={() => setPendingStatus(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change this order’s status to{' '}
              <span className="font-semibold text-blue-600">{pendingStatus?.newStatus}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingStatus(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmStatusChange}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default AdminOrdersPage
