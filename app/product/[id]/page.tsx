'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useCartStore } from '@/lib/store/cartStore'
import { useSession } from 'next-auth/react'

type Product = {
  id?: string
  name?: string
  price?: number
  description?: string
  image?: string
}

type Review = {
  id: string
  userId: string
  productId: string
  rating: number
  comment?: string
  user?: { name?: string; image?: string }
  createdAt?: string
}

const Page = () => {
  const params = useParams()
  const id = params?.id as string | undefined
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [rating, setRating] = useState<number>(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [average, setAverage] = useState(0);
  const [total, setTotal] = useState(0);

  const addToCart = useCartStore((state) => state.addToCart)

  useEffect(() => {
    if (!id) return

    const fetchProduct = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/getProduct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setProduct(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/review?productId=${id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        const data = await res.json()
        if (res.ok) {
          setReviews(Array.isArray(data) ? data : [])
        } else {
          console.error('Failed to fetch reviews:', data.error)
          setReviews([])
        }
      } catch (err) {
        console.error('Error fetching reviews:', err)
        setReviews([])
      }
    }

    const fetchAverageOfReview=async()=>{
      fetch(`/api/review/average/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setAverage(data.average || 0);
        setTotal(data.totalReviews || 0);
      })
    }

    fetchProduct()
    fetchAverageOfReview()
    fetchReviews()
  }, [id])

  const { data: session } = useSession()

 const handleReviewSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!session?.user?.email) return alert("Please login first");

  try {
    const res = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: id,
        rating,
        comment,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      // show server error message
      alert(data?.error ?? "Failed to submit review");
      return;
    }

    // prepend new review to UI
    setReviews(prev => [data, ...prev]);
    setRating(0);
    setComment("");
  } catch (err) {
    console.error("Failed to submit review:", err);
    alert("Failed to submit review");
  }
};
useEffect(() => {
  if (!id) return;
  fetch(`/api/reviews?productId=${encodeURIComponent(id)}`)
    .then(r => r.json())
    .then(d => {
      if (Array.isArray(d)) setReviews(d);
      else {
        console.error("unexpected reviews response:", d);
        setReviews([]);
      }
    })
    .catch(err => {
      console.error("fetch reviews err", err);
      setReviews([]);
    });
}, [id]);


  if (!id) return <div>No product id provided</div>
  if (loading) return <div>Loading product...</div>
  if (error) return <div>Error: {error}</div>
  if (!product) return <div>Product not found</div>

  const formattedPrice =
    typeof product.price === 'number'
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.price)
      : product.price ?? 'N/A'

  return (
    <div className="w-[100vw] min-h-[100vh] mx-auto px-4 py-10 grid md:grid-cols-2 gap-10 bg-amber-50">
      {/* Image Column */}
      <div className="w-full h-[500px] rounded-2xl overflow-hidden shadow-lg bg-gray-100">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
        )}
      </div>

      {/* Details Column */}
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">{product.name}</h1>
          <p className="text-2xl font-semibold text-indigo-600 mt-2">{formattedPrice}</p>
        </div>

        <p className="text-gray-700 leading-relaxed text-base">{product.description}</p>

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
          className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition"
        >
          Add to Cart
        </button>
 <div className="flex items-center space-x-2 mt-4">
        {/* ⭐ Display stars */}
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n}>
            {average >= n ? "⭐" : "☆"}
          </span>
        ))}

        <span className="ml-2 text-sm text-gray-500">
          {average.toFixed(1)} ({total} reviews)
        </span>
      </div>
        {/* Reviews Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Reviews</h2>

          {/* Review Form */}
          <div className="p-4 bg-white rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-medium mb-2">Write a review</h3>
            <div className="flex items-center mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  className={`cursor-pointer text-2xl ${
                    star <= rating ? 'text-yellow-500' : 'text-gray-300'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border rounded-md p-2 mb-3"
              placeholder="Write your review..."
            />
            <button
              onClick={handleReviewSubmit}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Submit
            </button>
          </div>

          {/* Display Reviews */}
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center mb-2">
                    <div className="font-semibold text-gray-800 mr-2">
                      {r.user?.name || 'Anonymous'}
                    </div>
                    <div className="text-yellow-500">{'★'.repeat(r.rating)}</div>
                  </div>
                  <p className="text-gray-600">{r.comment}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(r.createdAt ?? '').toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>No reviews yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Page
