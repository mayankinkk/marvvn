'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft, Plus, X } from 'lucide-react'
import Link from 'next/link'

interface ProductFormProps {
  productId?: string
}

export default function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter()
  const isEdit = !!productId
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    handle: '',
    title: '',
    description: '',
    price: '',
    compare_at_price: '',
    images: '',
    category: 'men',
    collection: '',
    tags: '',
    sizes: '',
    colors: '',
    is_new: false,
    is_bestseller: false,
    badge: '',
    fabric_composition: '',
    gsm: '',
    waist: '',
    length: '',
    model_info: '',
    what_you_get: '',
    size_fit_text: '',
  })

  useEffect(() => {
    if (isEdit) {
      fetch(`/api/admin/products/${productId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.product) {
            const p = data.product
            setForm({
              handle: p.handle || '',
              title: p.title || '',
              description: p.description || '',
              price: p.price?.toString() || '',
              compare_at_price: p.compare_at_price?.toString() || '',
              images: (p.images || []).join('\n'),
              category: p.category || 'men',
              collection: (p.collection || []).join(', '),
              tags: (p.tags || []).join(', '),
              sizes: (p.sizes || []).join(', '),
              colors: (p.colors || []).join(', '),
              is_new: p.is_new || false,
              is_bestseller: p.is_bestseller || false,
              badge: p.badge || '',
              fabric_composition: p.fabric_composition || '',
              gsm: p.gsm || '',
              waist: p.waist || '',
              length: p.length || '',
              model_info: p.model_info || '',
              what_you_get: JSON.stringify(p.what_you_get || []),
              size_fit_text: p.size_fit_text || '',
            })
          }
        })
    }
  }, [productId, isEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const body = {
      handle: form.handle,
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
      images: form.images.split('\n').map((s) => s.trim()).filter(Boolean),
      category: form.category,
      collection: form.collection.split(',').map((s) => s.trim()).filter(Boolean),
      tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
      sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      colors: form.colors.split(',').map((s) => s.trim()).filter(Boolean),
      is_new: form.is_new,
      is_bestseller: form.is_bestseller,
      badge: form.badge || null,
      fabric_composition: form.fabric_composition,
      gsm: form.gsm,
      waist: form.waist,
      length: form.length,
      model_info: form.model_info,
      what_you_get: (() => { try { return JSON.parse(form.what_you_get || '[]') } catch { return [] } })(),
      size_fit_text: form.size_fit_text,
    }

    try {
      const url = isEdit ? `/api/admin/products/${productId}` : '/api/admin/products'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save product')
      }

      router.push('/admin/products')
    } catch (err: any) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="p-2 hover:bg-marvvn-gray-100 rounded transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-display font-medium">
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Handle (URL slug) *</label>
            <input
              type="text"
              value={form.handle}
              onChange={(e) => setForm({ ...form, handle: e.target.value })}
              className="input-field"
              required
              placeholder="my-product-name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input-field"
            rows={3}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Price *</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="input-field"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Compare at Price</label>
            <input
              type="number"
              value={form.compare_at_price}
              onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })}
              className="input-field"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input-field"
              required
            >
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Images (one URL per line) *</label>
          <textarea
            value={form.images}
            onChange={(e) => setForm({ ...form, images: e.target.value })}
            className="input-field font-mono text-xs"
            rows={4}
            required
            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Collections (comma-separated)</label>
            <input
              type="text"
              value={form.collection}
              onChange={(e) => setForm({ ...form, collection: e.target.value })}
              className="input-field"
              placeholder="new-arrivals, oversized-t-shirts"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="input-field"
              placeholder="oversized, cotton"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Sizes (comma-separated) *</label>
            <input
              type="text"
              value={form.sizes}
              onChange={(e) => setForm({ ...form, sizes: e.target.value })}
              className="input-field"
              required
              placeholder="S, M, L, XL, XXL"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Colors (comma-separated) *</label>
            <input
              type="text"
              value={form.colors}
              onChange={(e) => setForm({ ...form, colors: e.target.value })}
              className="input-field"
              required
              placeholder="Black, White"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Badge</label>
            <select
              value={form.badge}
              onChange={(e) => setForm({ ...form, badge: e.target.value })}
              className="input-field"
            >
              <option value="">None</option>
              <option value="new">New</option>
              <option value="sale">Sale</option>
              <option value="bestseller">Bestseller</option>
            </select>
          </div>
          <div className="flex items-end gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_new}
                onChange={(e) => setForm({ ...form, is_new: e.target.checked })}
                className="accent-marvvn-black w-4 h-4"
              />
              <span className="text-sm">New Arrival</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_bestseller}
                onChange={(e) => setForm({ ...form, is_bestseller: e.target.checked })}
                className="accent-marvvn-black w-4 h-4"
              />
              <span className="text-sm">Bestseller</span>
            </label>
          </div>
        </div>

        {/* Product Attributes — shown on product detail page */}
        <div className="border-t pt-6 space-y-4">
          <div>
            <h3 className="font-medium text-sm mb-1">Product Attributes</h3>
            <p className="text-xs text-marvvn-gray-500">Details shown on the product detail page (Size & Fit tab)</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Fabric Composition</label>
              <input
                type="text"
                value={form.fabric_composition}
                onChange={(e) => setForm({ ...form, fabric_composition: e.target.value })}
                className="input-field"
                placeholder="60% Cotton 40% Polyester"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">GSM</label>
              <input
                type="text"
                value={form.gsm}
                onChange={(e) => setForm({ ...form, gsm: e.target.value })}
                className="input-field"
                placeholder="320"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Waist (Size info)</label>
              <input
                type="text"
                value={form.waist}
                onChange={(e) => setForm({ ...form, waist: e.target.value })}
                className="input-field"
                placeholder="28 - 30 inches"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Length / Inseam</label>
              <input
                type="text"
                value={form.length}
                onChange={(e) => setForm({ ...form, length: e.target.value })}
                className="input-field"
                placeholder="42 inches"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Model Info (per-product override)</label>
            <input
              type="text"
              value={form.model_info}
              onChange={(e) => setForm({ ...form, model_info: e.target.value })}
              className="input-field"
              placeholder="Model is 5'9&quot; and wears size M"
            />
            <p className="text-xs text-marvvn-gray-500 mt-1">Leave empty to use the global Size & Fit setting</p>
          </div>
        </div>

        {/* Per-product What You Get */}
        <div className="border-t pt-6 space-y-4">
          <div>
            <h3 className="font-medium text-sm mb-1">What You Get (per product)</h3>
            <p className="text-xs text-marvvn-gray-500">Leave empty to use global settings. Add features specific to this product.</p>
          </div>
          <WhatYouGetEditor value={form.what_you_get} onChange={(v) => setForm({ ...form, what_you_get: v })} />
        </div>

        {/* Per-product Size & Fit text */}
        <div className="border-t pt-6 space-y-4">
          <div>
            <h3 className="font-medium text-sm mb-1">Size & Fit Text (per product)</h3>
            <p className="text-xs text-marvvn-gray-500">Custom text shown in the Size & Fit tab. Leave empty to use global settings.</p>
          </div>
          <textarea
            value={form.size_fit_text}
            onChange={(e) => setForm({ ...form, size_fit_text: e.target.value })}
            className="input-field w-full min-h-[80px]"
            placeholder="The model (Height 5'7&quot;) is wearing size S&#10;Waist - 28 inches&#10;Length - 42 inches"
          />
          <p className="text-xs text-marvvn-gray-500">One line per item. Supports multi-line display on the product page.</p>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Link href="/admin/products" className="btn-secondary px-6 py-3">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary px-6 py-3 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  )
}

const iconOptions = [
  { value: 'package', label: 'Package' },
  { value: 'credit-card', label: 'Credit Card' },
  { value: 'zap', label: 'Lightning' },
  { value: 'rotate-ccw', label: 'Rotate/Return' },
  { value: 'truck', label: 'Truck' },
  { value: 'shield', label: 'Shield' },
  { value: 'heart', label: 'Heart' },
  { value: 'star', label: 'Star' },
]

function WhatYouGetEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const features: { icon: string; title: string; subtitle: string }[] = (() => {
    try { return JSON.parse(value || '[]') } catch { return [] }
  })()

  const add = () => onChange(JSON.stringify([...features, { icon: 'package', title: '', subtitle: '' }]))
  const remove = (i: number) => onChange(JSON.stringify(features.filter((_, idx) => idx !== i)))
  const update = (i: number, field: string, val: string) => {
    onChange(JSON.stringify(features.map((f, idx) => idx === i ? { ...f, [field]: val } : f)))
  }

  return (
    <div className="space-y-3">
      {features.map((feat, i) => (
        <div key={i} className="grid grid-cols-[110px_1fr_1fr_auto] gap-2 items-end">
          <select
            value={feat.icon}
            onChange={(e) => update(i, 'icon', e.target.value)}
            className="input-field text-sm"
          >
            {iconOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <input
            type="text"
            value={feat.title}
            onChange={(e) => update(i, 'title', e.target.value)}
            className="input-field text-sm"
            placeholder="Title"
          />
          <input
            type="text"
            value={feat.subtitle}
            onChange={(e) => update(i, 'subtitle', e.target.value)}
            className="input-field text-sm"
            placeholder="Subtitle"
          />
          <button type="button" onClick={() => remove(i)} className="p-2 text-marvvn-gray-400 hover:text-red-500 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-1.5 text-xs font-medium text-marvvn-black hover:underline cursor-pointer">
        <Plus className="w-3.5 h-3.5" /> Add Feature
      </button>
    </div>
  )
}
