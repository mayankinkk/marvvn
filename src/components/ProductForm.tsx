'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft, Plus, X } from 'lucide-react'
import Link from 'next/link'
import MultiImageUpload from './MultiImageUpload'
import { cn } from '@/lib/utils'

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
    images: [] as string[],
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

  const [variantStock, setVariantStock] = useState<Record<string, number>>({})

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
              images: p.images || [],
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
            // Load existing variants
            if (p.variants && Array.isArray(p.variants)) {
              const stockMap: Record<string, number> = {}
              for (const v of p.variants) {
                stockMap[`${v.size}|${v.color}`] = v.stock
              }
              setVariantStock(stockMap)
            }
          }
        })
    }
  }, [productId, isEdit])

  const parsedSizes = form.sizes.split(',').map(s => s.trim()).filter(Boolean)
  const parsedColors = form.colors.split(',').map(s => s.trim()).filter(Boolean)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    if (form.images.length === 0) {
      setError('At least one product image is required')
      setSaving(false)
      return
    }

    const body = {
      handle: form.handle,
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
      images: form.images,
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
      variants: Object.entries(variantStock)
        .filter(([_, stock]) => stock > 0)
        .map(([key, stock]) => {
          const [size, color] = key.split('|')
          return { size, color, stock }
        }),
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
          <label className="block text-sm font-medium mb-1">Product Images *</label>
          <MultiImageUpload
            images={form.images}
            onChange={(images) => setForm({ ...form, images })}
            folder="products"
            maxImages={10}
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

        {/* Size Availability — quick toggle */}
        {parsedSizes.length > 0 && (
          <div className="border-t pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-sm mb-1">Size Availability</h3>
                <p className="text-xs text-marvvn-gray-500">Uncheck sizes that are unavailable. Customers will see a strikethrough on unavailable sizes.</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const updated = { ...variantStock }
                    parsedSizes.forEach(size => {
                      parsedColors.forEach(color => {
                        const key = `${size}|${color}`
                        if (!updated[key] || updated[key] === 0) updated[key] = 10
                      })
                    })
                    setVariantStock(updated)
                  }}
                  className="text-xs text-marvvn-black underline hover:no-underline cursor-pointer"
                >
                  Mark all available
                </button>
                <span className="text-marvvn-gray-300">|</span>
                <button
                  type="button"
                  onClick={() => {
                    const updated = { ...variantStock }
                    parsedSizes.forEach(size => {
                      parsedColors.forEach(color => {
                        updated[`${size}|${color}`] = 0
                      })
                    })
                    setVariantStock(updated)
                  }}
                  className="text-xs text-marvvn-gray-500 underline hover:no-underline cursor-pointer"
                >
                  Mark all unavailable
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {parsedSizes.map((size) => {
                const isAvailable = parsedColors.some(color => (variantStock[`${size}|${color}`] ?? 0) > 0)
                return (
                  <label
                    key={size}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 border text-sm cursor-pointer transition-colors',
                      isAvailable
                        ? 'border-marvvn-black bg-marvvn-black text-white'
                        : 'border-marvvn-gray-300 text-marvvn-gray-400 line-through'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isAvailable}
                      onChange={(e) => {
                        const updated = { ...variantStock }
                        const stock = e.target.checked ? 10 : 0
                        parsedColors.forEach(color => {
                          updated[`${size}|${color}`] = stock
                        })
                        setVariantStock(updated)
                      }}
                      className="sr-only"
                    />
                    {size}
                  </label>
                )
              })}
            </div>
          </div>
        )}

        {/* Per-variant stock grid */}
        {parsedSizes.length > 0 && parsedColors.length > 0 && (
          <div className="border-t pt-6 space-y-3">
            <div>
              <h3 className="font-medium text-sm mb-1">Stock by Size & Color</h3>
              <p className="text-xs text-marvvn-gray-500">Set exact inventory for each size/color combination. Sizes with stock = 0 show as unavailable to customers.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-3 font-medium text-marvvn-gray-500">Size \ Color</th>
                    {parsedColors.map((color) => (
                      <th key={color} className="py-2 px-3 font-medium text-marvvn-gray-500 text-center">{color}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsedSizes.map((size) => {
                    const isAvailable = parsedColors.some(color => (variantStock[`${size}|${color}`] ?? 0) > 0)
                    return (
                      <tr key={size} className={cn('border-t border-marvvn-gray-100', !isAvailable && 'bg-marvvn-gray-50')}>
                        <td className={cn('py-2 px-3 font-medium', !isAvailable && 'text-marvvn-gray-400 line-through')}>{size}</td>
                        {parsedColors.map((color) => {
                          const key = `${size}|${color}`
                          return (
                            <td key={color} className="py-2 px-3">
                              <input
                                type="number"
                                min="0"
                                value={variantStock[key] ?? 0}
                                onChange={(e) => setVariantStock({
                                  ...variantStock,
                                  [key]: Math.max(0, parseInt(e.target.value) || 0),
                                })}
                                className={cn(
                                  'w-full text-center input-field py-1 text-xs',
                                  (variantStock[key] ?? 0) === 0 && 'text-marvvn-gray-300'
                                )}
                              />
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-marvvn-gray-400">
              Total stock: {Object.values(variantStock).reduce((a, b) => a + b, 0)} units across {parsedSizes.length * parsedColors.length} variants
            </p>
          </div>
        )}

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
