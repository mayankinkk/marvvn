'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Star, X, Pencil } from 'lucide-react'

interface Review {
  id: string
  name: string
  email: string
  text: string
  rating: number
  product_handle: string
  verified: boolean
  featured: boolean
  created_at: string
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Review | null>(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: '',
    email: '',
    text: '',
    rating: 5,
    product_handle: '',
    verified: false,
    featured: false,
  })

  useEffect(() => {
    fetch('/api/admin/reviews')
      .then((res) => res.json())
      .then((data) => { setReviews(data.reviews || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const resetForm = () => {
    setForm({ name: '', email: '', text: '', rating: 5, product_handle: '', verified: false, featured: false })
    setEditing(null)
  }

  const handleEdit = (review: Review) => {
    setForm({
      name: review.name,
      email: review.email || '',
      text: review.text,
      rating: review.rating,
      product_handle: review.product_handle || '',
      verified: review.verified,
      featured: review.featured,
    })
    setEditing(review)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = '/api/admin/reviews'
      const method = editing ? 'PUT' : 'POST'
      const body = editing ? { ...form, id: editing.id } : form

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const data = await res.json()
        if (editing) {
          setReviews(reviews.map(r => r.id === editing.id ? { ...r, ...data.review } : r))
        } else {
          setReviews([data.review, ...reviews])
        }
        setShowForm(false)
        resetForm()
      }
    } catch {}
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review?')) return
    const res = await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      setReviews(reviews.filter(r => r.id !== id))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-marvvn-black border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-medium">Reviews</h1>
          <p className="text-sm text-marvvn-gray-500 mt-1">{reviews.length} total reviews</p>
        </div>
        <button
          type="button"
          onClick={() => { resetForm(); setShowForm(true) }}
          className="btn-primary flex items-center gap-2 text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Review
        </button>
      </div>

      {showForm && (
        <div className="bg-white border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium">{editing ? 'Edit Review' : 'New Review'}</h2>
            <button type="button" onClick={() => { setShowForm(false); resetForm() }} className="cursor-pointer"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Review Text *</label>
              <textarea
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                className="input-field"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rating *</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setForm({ ...form, rating: star })}
                    className="cursor-pointer"
                  >
                    <Star className={`w-6 h-6 ${star <= form.rating ? 'fill-marvvn-gold text-marvvn-gold' : 'text-marvvn-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Product Handle</label>
              <input
                type="text"
                value={form.product_handle}
                onChange={(e) => setForm({ ...form, product_handle: e.target.value })}
                className="input-field"
                placeholder="Optional"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.verified}
                  onChange={(e) => setForm({ ...form, verified: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm">Verified</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm">Featured (show on homepage)</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <button type="submit" disabled={saving} className="btn-primary px-6 py-2 text-sm cursor-pointer disabled:opacity-50">
                {saving ? 'Saving...' : editing ? 'Update Review' : 'Add Review'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-marvvn-gray-500">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Review</th>
                <th className="px-6 py-3 font-medium">Rating</th>
                <th className="px-6 py-3 font-medium">Product</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-marvvn-gray-400">No reviews yet.</td></tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id} className="border-b last:border-0 hover:bg-marvvn-gray-50">
                    <td className="px-6 py-3 font-medium">{review.name}</td>
                    <td className="px-6 py-3 max-w-xs truncate text-marvvn-gray-600">{review.text}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-marvvn-gold text-marvvn-gold" />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-xs text-marvvn-gray-500">{review.product_handle || '-'}</td>
                    <td className="px-6 py-3">
                      <div className="flex gap-1">
                        {review.verified && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">Verified</span>
                        )}
                        {review.featured && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">Featured</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button type="button" onClick={() => handleEdit(review)} className="p-1 hover:bg-marvvn-gray-100 rounded cursor-pointer">
                          <Pencil className="w-4 h-4 text-marvvn-gray-400" />
                        </button>
                        <button type="button" onClick={() => handleDelete(review.id)} className="p-1 hover:bg-red-50 rounded cursor-pointer">
                          <Trash2 className="w-4 h-4 text-marvvn-gray-400 hover:text-marvvn-red" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
