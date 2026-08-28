'use client'

import { useState, useEffect } from 'react'
import { Star, Check } from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'

interface Review {
  id: string
  name: string
  text: string
  rating: number
  verified: boolean
  created_at: string
}

interface ReviewsProps {
  productHandle: string
}

export default function ProductReviews({ productHandle }: ReviewsProps) {
  const { user } = useAuthStore()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ rating: 5, text: '' })
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetch(`/api/reviews/product?handle=${productHandle}`)
      .then(res => res.json())
      .then(data => { setReviews(data.reviews || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [productHandle])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !form.text) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_handle: productHandle,
          text: form.text,
          rating: form.rating,
          verified: true,
        }),
      })
      if (res.ok) {
        setSubmitted(true)
        setShowForm(false)
        const newReview: Review = {
          id: Date.now().toString(),
          name: user.name || 'You',
          text: form.text,
          rating: form.rating,
          verified: true,
          created_at: new Date().toISOString(),
        }
        setReviews([newReview, ...reviews])
      }
    } catch {}
    setSubmitting(false)
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0'

  return (
    <div className="mt-12 pt-8 border-t">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium">Customer Reviews</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} className={`w-4 h-4 ${star <= Math.round(Number(avgRating)) ? 'fill-marvvn-gold text-marvvn-gold' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-sm text-marvvn-gray-500">{avgRating} ({reviews.length} reviews)</span>
          </div>
        </div>
        {user && !submitted && (
          <button onClick={() => setShowForm(!showForm)} className="btn-secondary text-sm">
            Write a Review
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-marvvn-gray-50 p-4 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} type="button" onClick={() => setForm({ ...form, rating: star })}>
                  <Star className={`w-6 h-6 cursor-pointer ${star <= form.rating ? 'fill-marvvn-gold text-marvvn-gold' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Your Review</label>
            <textarea
              value={form.text}
              onChange={e => setForm({ ...form, text: e.target.value })}
              className="input-field"
              rows={3}
              required
              placeholder="What did you like about this product?"
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary text-sm disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      {submitted && (
        <div className="bg-green-50 p-4 mb-6 text-green-700 text-sm flex items-center gap-2">
          <Check className="w-4 h-4" /> Thank you! Your review has been submitted.
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="h-20 bg-marvvn-gray-100 animate-pulse" />)}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-marvvn-gray-500">No reviews yet. Be the first to review this product!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="border-b pb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-marvvn-gold text-marvvn-gold" />
                  ))}
                </div>
                <span className="text-sm font-medium">{review.name}</span>
                {review.verified && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verified</span>
                )}
              </div>
              <p className="text-sm text-marvvn-gray-600">{review.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
