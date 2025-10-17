'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useCartStore } from '@/lib/store/cartStore'

type Product = {
  id?: string
  name?: string
  price?: number
  description?: string
  image?: string
  [key: string]: any
}

const Page = () => {
  const params = useParams()
  const id = params?.id as string | undefined

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addToCart = useCartStore((state) => state.addToCart)

  useEffect(() => {
    if (!id) return
    const fetchProduct = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/getProduct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        })

        const data = await res.json()
        if (!res.ok && data?.error) {
          setError(data.error)
          setProduct(null)
        } else {
          setProduct(data)
        }
      } catch (err: any) {
        setError(err?.message ?? 'Failed to fetch product')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  if (!id) return <div>No product id provided</div>
  if (loading) return <div>Loading product...</div>
  if (error) return <div>Error: {error}</div>
  if (!product) return <div>Product not found</div>

  const formattedPrice =
    typeof product.price === 'number'
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.price)
      : product.price ?? 'N/A'

  return (
    <div className="w-[100vw] h-[100vh] mx-auto px-4 py-10 grid md:grid-cols-2 gap-10 items-start bg-amber-50">
      {/* Image Column */}
      <div className="w-full h-[500px] rounded-2xl overflow-hidden shadow-lg bg-gray-100">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-20 w-20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Details Column */}
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">{product.name}</h1>
          <p className="text-2xl font-semibold text-indigo-600 mt-2">{formattedPrice}</p>
        </div>

        <div className="text-gray-700 leading-relaxed text-base">
          {product.description}
        </div>

        <button
          onClick={() => {
            addToCart({
              id: product.id!,
              name: product.name!,
              price: product.price!,
              image: product.image!,
            })
            alert('Added to cart!')
          }}
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          Add to Cart
        </button>
      </div>
    </div>
  )
}

export default Page
