'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft, ChevronRight, Mail } from 'lucide-react'

interface Customer {
  id: string
  name: string | null
  email: string
  image: string | null
  createdAt: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/customers?page=${page}&limit=8`)
        const data = await res.json()
        setCustomers(data.customers || [])
        setTotalPages(data.totalPages || 1)
      } catch (err) {
        console.error('Error fetching customers:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCustomers()
  }, [page])

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-2xl font-bold mb-6">Customers</h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-3">
                <Skeleton className="w-16 h-16 rounded-full mx-auto" />
                <Skeleton className="h-4 w-24 mx-auto" />
                <Skeleton className="h-4 w-32 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : customers.length === 0 ? (
        <p className="text-gray-500 text-center">No customers found.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {customers.map((customer) => (
              <Card
                key={customer.id}
                className="hover:shadow-md transition border border-gray-100"
              >
                <CardHeader className="flex flex-col items-center">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden mb-3 border">
                    {customer.image ? (
                      <Image
                        src={customer.image}
                        alt={customer.name || 'Customer'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="bg-gray-200 w-full h-full flex items-center justify-center text-gray-500 text-lg font-semibold">
                        {customer.name?.[0] || '?'}
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-base font-semibold text-gray-800">
                    {customer.name || 'Unnamed User'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center text-gray-600">
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Mail size={14} />
                    <span>{customer.email}</span>
                    {customer.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL?<span>(ADMIN)</span>:null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Prev
            </Button>

            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
