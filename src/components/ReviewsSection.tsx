'use client'

import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'

interface Review {
  id: string
  name: string
  text: string
  rating: number
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/reviews')
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.reviews || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading || reviews.length === 0) return null

  return (
    <section className="py-12 lg:py-20 bg-marvvn-gray-50">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-6 lg:p-8">
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-marvvn-gold text-marvvn-gold" />
                ))}
              </div>
              <p className="text-sm text-marvvn-gray-600 mb-4 italic">&quot;{review.text}&quot;</p>
              <p className="text-sm font-medium">{review.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
