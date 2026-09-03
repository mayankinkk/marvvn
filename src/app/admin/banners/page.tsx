'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Upload, X, Check, ImageIcon, ExternalLink } from 'lucide-react'

interface BannerSlot {
  id: string
  label: string
  description: string
  imageKey: string
  mobileImageKey?: string
  titleKey?: string
  subtitleKey?: string
  linkKey?: string
  aspectHint: string
}

const bannerSlots: BannerSlot[] = [
  {
    id: 'hero-1',
    label: 'Hero Slide 1',
    description: 'First slide of the main hero carousel (full screen)',
    imageKey: 'hero_banner_1_image',
    mobileImageKey: 'hero_banner_1_mobile_image',
    titleKey: 'hero_banner_1_title',
    subtitleKey: 'hero_banner_1_subtitle',
    linkKey: 'hero_banner_1_link',
    aspectHint: 'Desktop: 16:9 or wider · Mobile: 9:16',
  },
  {
    id: 'hero-2',
    label: 'Hero Slide 2',
    description: 'Second slide of the hero carousel',
    imageKey: 'hero_banner_2_image',
    mobileImageKey: 'hero_banner_2_mobile_image',
    titleKey: 'hero_banner_2_title',
    subtitleKey: 'hero_banner_2_subtitle',
    linkKey: 'hero_banner_2_link',
    aspectHint: 'Desktop: 16:9 or wider · Mobile: 9:16',
  },
  {
    id: 'hero-3',
    label: 'Hero Slide 3',
    description: 'Third slide of the hero carousel',
    imageKey: 'hero_banner_3_image',
    mobileImageKey: 'hero_banner_3_mobile_image',
    titleKey: 'hero_banner_3_title',
    subtitleKey: 'hero_banner_3_subtitle',
    linkKey: 'hero_banner_3_link',
    aspectHint: 'Desktop: 16:9 or wider · Mobile: 9:16',
  },
  {
    id: 'shop-mens',
    label: 'Shop Mens Banner',
    description: 'Left panel of the Shop Mens / Shop Womens split section',
    imageKey: 'shop_mens_image',
    aspectHint: 'Portrait: 3:4 or 4:5 recommended',
  },
  {
    id: 'shop-womens',
    label: 'Shop Womens Banner',
    description: 'Right panel of the Shop Mens / Shop Womens split section',
    imageKey: 'shop_womens_image',
    aspectHint: 'Portrait: 3:4 or 4:5 recommended',
  },
  {
    id: 'promo-4',
    label: 'Promo Banner',
    description: 'Full-width promotional banner below New Arrivals',
    imageKey: 'promo_4_image',
    mobileImageKey: 'promo_4_mobile_image',
    titleKey: 'promo_4_title',
    subtitleKey: 'promo_4_subtitle',
    linkKey: 'promo_4_link',
    aspectHint: 'Desktop: 21:9 cinematic · Mobile: 16:9',
  },
  {
    id: 'brand-story',
    label: 'Brand Story Banner',
    description: 'Left-side image in the About / Brand Story section on the homepage',
    imageKey: 'brand_story_image',
    aspectHint: 'Landscape: 3:2 or 16:9 recommended',
  },
]

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/banners')
      .then(res => res.json())
      .then(data => { setBanners(data.banners || {}); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleUpload = async (key: string, file: File, folder: string) => {
    setUploading(key)
    setError(null)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) {
        const updated = { ...banners, [key]: data.url }
        setBanners(updated)
        // Auto-save on upload
        await saveBanners(updated)
      } else {
        setError(data.error || 'Upload failed')
      }
    } catch (e) {
      setError('Upload failed. Please try again.')
    }
    setUploading(null)
  }

  const saveBanners = async (data: Record<string, string>) => {
    setSaving(true)
    setSaved(false)
    try {
      await fetch('/api/banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banners: data }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Save failed. Please try again.')
    }
    setSaving(false)
  }

  const handleSave = () => saveBanners(banners)

  const update = (key: string, value: string) => {
    setBanners(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Banners & Images</h1>
            <p className="text-sm text-gray-400 mt-0.5">Upload and manage homepage banners. Images auto-save on upload.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Preview store
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save All'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center justify-between p-3 bg-red-50 border border-red-200 text-sm text-red-700">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {saved && !saving && (
        <div className="mb-6 flex items-center gap-2 p-3 bg-green-50 border border-green-200 text-sm text-green-700">
          <Check className="w-4 h-4" /> Banners saved successfully!
        </div>
      )}

      <div className="space-y-6">
        {bannerSlots.map(slot => (
          <BannerCard
            key={slot.id}
            slot={slot}
            banners={banners}
            uploading={uploading}
            onUpload={handleUpload}
            onUpdate={update}
          />
        ))}
      </div>
    </div>
  )
}

function BannerCard({
  slot,
  banners,
  uploading,
  onUpload,
  onUpdate,
}: {
  slot: BannerSlot
  banners: Record<string, string>
  uploading: string | null
  onUpload: (key: string, file: File, folder: string) => void
  onUpdate: (key: string, value: string) => void
}) {
  const hasText = !!(slot.titleKey || slot.subtitleKey || slot.linkKey)

  return (
    <div className="bg-white border border-gray-200 overflow-hidden">
      {/* Card header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">{slot.label}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{slot.description}</p>
        </div>
        <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-1 rounded font-mono">{slot.aspectHint}</span>
      </div>

      <div className="p-5">
        <div className={`grid gap-4 ${slot.mobileImageKey ? 'md:grid-cols-2' : 'md:grid-cols-1 max-w-lg'}`}>
          {/* Desktop / Main Image */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              {slot.mobileImageKey ? 'Desktop Image' : 'Image'}
            </label>
            <ImageDropZone
              value={banners[slot.imageKey] || ''}
              onChange={(url) => onUpdate(slot.imageKey, url)}
              onUpload={(file) => onUpload(slot.imageKey, file, `banners/${slot.id}`)}
              uploading={uploading === slot.imageKey}
              label={slot.mobileImageKey ? 'Upload desktop image' : 'Upload image'}
            />
          </div>

          {/* Mobile Image */}
          {slot.mobileImageKey && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Mobile Image
              </label>
              <ImageDropZone
                value={banners[slot.mobileImageKey] || ''}
                onChange={(url) => onUpdate(slot.mobileImageKey!, url)}
                onUpload={(file) => onUpload(slot.mobileImageKey!, file, `banners/${slot.id}-mobile`)}
                uploading={uploading === slot.mobileImageKey}
                label="Upload mobile image"
              />
            </div>
          )}
        </div>

        {/* Text fields */}
        {hasText && (
          <div className="mt-4 grid md:grid-cols-3 gap-3 pt-4 border-t border-gray-100">
            {slot.titleKey && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Title</label>
                <input
                  type="text"
                  value={banners[slot.titleKey] || ''}
                  onChange={(e) => onUpdate(slot.titleKey!, e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 focus:outline-none focus:border-gray-900 transition-colors"
                  placeholder="e.g. FREESTYLE COLLECTION"
                />
              </div>
            )}
            {slot.subtitleKey && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tagline / Subtitle</label>
                <input
                  type="text"
                  value={banners[slot.subtitleKey] || ''}
                  onChange={(e) => onUpdate(slot.subtitleKey!, e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 focus:outline-none focus:border-gray-900 transition-colors"
                  placeholder="e.g. MADE TO MOVE WITH YOU"
                />
              </div>
            )}
            {slot.linkKey && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Link URL</label>
                <input
                  type="text"
                  value={banners[slot.linkKey] || ''}
                  onChange={(e) => onUpdate(slot.linkKey!, e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 focus:outline-none focus:border-gray-900 transition-colors"
                  placeholder="/collections/new-arrivals"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ImageDropZone({
  value,
  onChange,
  onUpload,
  uploading,
  label,
}: {
  value: string
  onChange: (url: string) => void
  onUpload: (file: File) => void
  uploading: boolean
  label: string
}) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) onUpload(file)
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onUpload(file)
    // Reset so same file can be re-selected
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      {/* Preview or drop zone */}
      <div
        className={`relative border-2 transition-colors ${
          dragging ? 'border-gray-900 bg-gray-50' : 'border-dashed border-gray-200 hover:border-gray-400'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{ minHeight: '160px' }}
      >
        {value ? (
          <>
            <img
              src={value}
              alt="Banner preview"
              className="w-full object-cover"
              style={{ maxHeight: '220px', minHeight: '160px', objectPosition: 'center top' }}
            />
            {/* Overlay controls */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center gap-2 group">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-3 py-1.5 bg-white text-xs font-semibold text-gray-900 hover:bg-gray-100 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                Replace
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-xs font-semibold text-white hover:bg-red-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Remove
              </button>
            </div>
            {/* Upload spinner overlay */}
            {uploading && (
              <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
                <span className="text-xs text-gray-500">Uploading…</span>
              </div>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 cursor-pointer w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="w-7 h-7 animate-spin text-gray-400" />
                <span className="text-xs text-gray-400">Uploading…</span>
              </>
            ) : (
              <>
                <div className="w-10 h-10 bg-gray-100 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Drag & drop or click · JPG, PNG, WebP, SVG · Max 10MB</p>
                </div>
              </>
            )}
          </button>
        )}
      </div>

      {/* URL input */}
      <div className="flex gap-2">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-1.5 text-xs border border-gray-200 text-gray-600 placeholder-gray-300 focus:outline-none focus:border-gray-600 transition-colors font-mono"
          placeholder="Or paste image URL…"
        />
        {value && (
          <a href={value} target="_blank" rel="noopener noreferrer" className="px-2 flex items-center text-gray-400 hover:text-gray-700 border border-gray-200">
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}
