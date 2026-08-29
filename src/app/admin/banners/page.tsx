'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload, Save, Image, Loader2, X } from 'lucide-react'

interface BannerGroup {
  id: string
  label: string
  keys: { image: string; mobileImage: string; title: string; subtitle: string; link: string }
}

const bannerGroups: BannerGroup[] = [
  {
    id: 'hero-1',
    label: 'Hero Banner 1',
    keys: { image: 'hero_banner_1_image', mobileImage: 'hero_banner_1_mobile_image', title: 'hero_banner_1_title', subtitle: 'hero_banner_1_subtitle', link: 'hero_banner_1_link' },
  },
  {
    id: 'hero-2',
    label: 'Hero Banner 2',
    keys: { image: 'hero_banner_2_image', mobileImage: 'hero_banner_2_mobile_image', title: 'hero_banner_2_title', subtitle: 'hero_banner_2_subtitle', link: 'hero_banner_2_link' },
  },
  {
    id: 'hero-3',
    label: 'Hero Banner 3',
    keys: { image: 'hero_banner_3_image', mobileImage: 'hero_banner_3_mobile_image', title: 'hero_banner_3_title', subtitle: 'hero_banner_3_subtitle', link: 'hero_banner_3_link' },
  },
  {
    id: 'promo-4',
    label: 'Promo Banner 4',
    keys: { image: 'promo_4_image', mobileImage: 'promo_4_mobile_image', title: 'promo_4_title', subtitle: 'promo_4_subtitle', link: 'promo_4_link' },
  },
  {
    id: 'shop-gender',
    label: 'Shop By Gender',
    keys: { image: 'shop_mens_image', mobileImage: 'shop_womens_image', title: '', subtitle: '', link: '' },
  },
]

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/banners')
      .then(res => res.json())
      .then(data => { setBanners(data.banners || {}); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleUpload = async (key: string, file: File, folder: string) => {
    setUploading(key)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) {
        setBanners(prev => ({ ...prev, [key]: data.url }))
      }
    } catch (e) {
      console.error('Upload failed:', e)
    }
    setUploading(null)
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await fetch('/api/banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banners }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      console.error('Save failed:', e)
    }
    setSaving(false)
  }

  const updateBanner = (key: string, value: string) => {
    setBanners(prev => ({ ...prev, [key]: value }))
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
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-marvvn-gray-100 rounded transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-display font-medium">Banners & Images</h1>
            <p className="text-sm text-marvvn-gray-500">Upload and manage homepage banners</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-primary px-6 py-2 flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save All'}
        </button>
      </div>

      {saved && (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 text-sm text-green-700">
          Banners saved successfully!
        </div>
      )}

      <div className="space-y-8">
        {bannerGroups.map(group => (
          <div key={group.id} className="bg-white border p-6">
            <h2 className="font-medium text-lg mb-4">{group.label}</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {group.keys.image && (
                <div>
                  <label className="block text-sm font-medium mb-2">Desktop Image</label>
                  <ImageUpload
                    value={banners[group.keys.image] || ''}
                    onChange={(url) => updateBanner(group.keys.image, url)}
                    onUpload={(file) => handleUpload(group.keys.image, file, `banners/${group.id}`)}
                    uploading={uploading === group.keys.image}
                  />
                </div>
              )}

              {group.keys.mobileImage && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {group.id === 'shop-gender' ? 'Women Image' : 'Mobile Image'}
                  </label>
                  <ImageUpload
                    value={banners[group.keys.mobileImage] || ''}
                    onChange={(url) => updateBanner(group.keys.mobileImage, url)}
                    onUpload={(file) => handleUpload(group.keys.mobileImage, file, `banners/${group.id}`)}
                    uploading={uploading === group.keys.mobileImage}
                  />
                </div>
              )}

              {group.keys.title && (
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={banners[group.keys.title] || ''}
                    onChange={(e) => updateBanner(group.keys.title, e.target.value)}
                    className="input-field"
                    placeholder="e.g. FREESTYLE COLLECTION"
                  />
                </div>
              )}

              {group.keys.subtitle && (
                <div>
                  <label className="block text-sm font-medium mb-2">Subtitle / Tagline</label>
                  <input
                    type="text"
                    value={banners[group.keys.subtitle] || ''}
                    onChange={(e) => updateBanner(group.keys.subtitle, e.target.value)}
                    className="input-field"
                    placeholder="e.g. MADE TO MOVE WITH YOU"
                  />
                </div>
              )}

              {group.keys.link && (
                <div className={group.id === 'shop-gender' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium mb-2">Link URL</label>
                  <input
                    type="text"
                    value={banners[group.keys.link] || ''}
                    onChange={(e) => updateBanner(group.keys.link, e.target.value)}
                    className="input-field"
                    placeholder="e.g. /collections/new-arrivals"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ImageUpload({ value, onChange, onUpload, uploading }: {
  value: string
  onChange: (url: string) => void
  onUpload: (file: File) => void
  uploading: boolean
}) {
  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative group">
          <img src={value} alt="" className="w-full h-40 object-cover border" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <label className="px-3 py-1.5 bg-white text-sm font-medium cursor-pointer hover:bg-marvvn-gray-100">
              Replace
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) onUpload(file)
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => onChange('')}
              className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium hover:bg-red-700 cursor-pointer"
            >
              Remove
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-marvvn-gray-300 hover:border-marvvn-black transition-colors cursor-pointer">
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin text-marvvn-gray-400" />
          ) : (
            <>
              <Upload className="w-8 h-8 text-marvvn-gray-400 mb-2" />
              <span className="text-sm text-marvvn-gray-500">Click to upload</span>
              <span className="text-xs text-marvvn-gray-400">JPG, PNG, WebP, SVG</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onUpload(file)
            }}
          />
        </label>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field text-xs"
        placeholder="Or paste image URL"
      />
    </div>
  )
}
