'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, GripVertical, Save, Eye, EyeOff, ExternalLink, Loader2, Image as ImageIcon, Download, AlertTriangle, Copy } from 'lucide-react'

interface InstagramPost {
  id: string
  image_url: string
  caption: string
  link: string
  sort_order: number
  is_active: boolean
  created_at: string
}

interface ProductImage {
  id: string
  title: string
  handle: string
  image: string
  price: number
  imported: boolean
}

const SETUP_SQL = `CREATE TABLE IF NOT EXISTS instagram_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  link TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE instagram_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active instagram posts" ON instagram_posts
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage instagram posts" ON instagram_posts
  FOR ALL USING (auth.role() = 'authenticated');`

export default function InstagramPostsPage() {
  const [posts, setPosts] = useState<InstagramPost[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingPost, setEditingPost] = useState<Partial<InstagramPost> | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [productImages, setProductImages] = useState<ProductImage[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [importing, setImporting] = useState(false)
  const [setupRequired, setSetupRequired] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchPosts()
    fetchProductImages()
  }, [])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/instagram-posts')
      const data = await res.json()
      setPosts(data.posts || [])
      if (data.setupRequired) {
        setSetupRequired(true)
      }
    } catch {}
    setLoading(false)
  }

  const fetchProductImages = async () => {
    setLoadingProducts(true)
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      const existingUrls = new Set(posts.map(p => p.image_url))
      const images = (data.products || [])
        .flatMap((p: any) => (p.images || []).map((img: string) => ({
          id: p.id + '-' + img,
          title: p.title,
          handle: p.handle,
          image: img,
          price: p.price,
          imported: existingUrls.has(img),
        })))
        .filter((img: ProductImage) => img.image && img.image.startsWith('http'))
      setProductImages(images.slice(0, 50))
    } catch {}
    setLoadingProducts(false)
  }

  const handleSave = async (post: Partial<InstagramPost>) => {
    setSaving(true)
    try {
      const method = post.id ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/instagram-posts', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      })
      if (res.ok) {
        fetchPosts()
        setEditingPost(null)
        setIsAdding(false)
      }
    } catch {}
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return
    try {
      await fetch(`/api/admin/instagram-posts?id=${id}`, { method: 'DELETE' })
      fetchPosts()
      fetchProductImages()
    } catch {}
  }

  const handleToggleActive = async (post: InstagramPost) => {
    await handleSave({ ...post, is_active: !post.is_active })
  }

  const handleImportImage = async (image: ProductImage) => {
    setImporting(true)
    try {
      await fetch('/api/admin/instagram-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: image.image,
          caption: image.title,
          link: `/products/${image.handle}`,
          sort_order: posts.length,
          is_active: true,
        }),
      })
      fetchPosts()
      setProductImages(prev => prev.map(p => 
        p.image === image.image ? { ...p, imported: true } : p
      ))
    } catch {}
    setImporting(false)
  }

  const handleImportAll = async () => {
    setImporting(true)
    const unimported = productImages.filter(p => !p.imported).slice(0, 6)
    for (const image of unimported) {
      await fetch('/api/admin/instagram-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: image.image,
          caption: image.title,
          link: `/products/${image.handle}`,
          sort_order: posts.length,
          is_active: true,
        }),
      })
    }
    fetchPosts()
    fetchProductImages()
    setImporting(false)
  }

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const idx = posts.findIndex(p => p.id === id)
    if (idx === -1) return
    const newPosts = [...posts]
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= newPosts.length) return

    const temp = newPosts[idx].sort_order
    newPosts[idx].sort_order = newPosts[swapIdx].sort_order
    newPosts[swapIdx].sort_order = temp

    setPosts(newPosts)

    await fetch('/api/admin/instagram-posts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPosts[idx]),
    })
    await fetch('/api/admin/instagram-posts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPosts[swapIdx]),
    })
  }

  const copySetupSQL = () => {
    navigator.clipboard.writeText(SETUP_SQL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-medium">Instagram Feed Posts</h1>
          <p className="text-sm text-marvvn-gray-500 mt-1">Manage which posts appear on your homepage Instagram section</p>
        </div>
        {!setupRequired && (
          <button
            onClick={() => { setIsAdding(true); setEditingPost({ image_url: '', caption: '', link: '', sort_order: posts.length, is_active: true }) }}
            className="flex items-center gap-2 px-4 py-2 bg-marvvn-black text-white text-sm font-medium hover:bg-marvvn-gray-800 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Post
          </button>
        )}
      </div>

      {/* Setup Required Notice */}
      {setupRequired && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h2 className="font-medium flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Setup Required
          </h2>
          <p className="text-sm text-marvvn-gray-600 mb-3">
            You need to create the <code className="bg-amber-100 px-1 rounded">instagram_posts</code> table in Supabase first.
          </p>
          <ol className="text-sm text-marvvn-gray-600 space-y-2 list-decimal pl-5 mb-4">
            <li>Go to your <a href="https://supabase.com/dashboard" target="_blank" className="underline font-medium">Supabase Dashboard</a></li>
            <li>Click <strong>SQL Editor</strong> in the left sidebar</li>
            <li>Paste the SQL below and click <strong>Run</strong></li>
            <li>Refresh this page</li>
          </ol>
          <div className="relative">
            <pre className="bg-white border rounded p-3 text-xs font-mono overflow-x-auto max-h-48">{SETUP_SQL}</pre>
            <button
              onClick={copySetupSQL}
              className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-xs rounded cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {(isAdding || editingPost) && (
        <PostForm
          post={editingPost}
          onSave={handleSave}
          onCancel={() => { setEditingPost(null); setIsAdding(false) }}
          saving={saving}
        />
      )}

      {/* Import from Products */}
      {productImages.length > 0 && (
        <div className="bg-white border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-sm">Import from Products</h3>
            <button
              onClick={handleImportAll}
              disabled={importing || productImages.filter(p => !p.imported).length === 0}
              className="flex items-center gap-2 px-3 py-1.5 bg-marvvn-black text-white text-xs font-medium hover:bg-marvvn-gray-800 disabled:opacity-50 cursor-pointer"
            >
              {importing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
              Import First 6
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {productImages.slice(0, 20).map((img) => (
              <div
                key={img.id}
                className={`relative flex-shrink-0 w-20 h-20 rounded overflow-hidden border ${
                  img.imported ? 'border-green-500 opacity-50' : 'border-gray-200 hover:border-marvvn-black cursor-pointer'
                }`}
                onClick={() => !img.imported && handleImportImage(img)}
              >
                <img src={img.image} alt={img.title} className="w-full h-full object-cover" />
                {img.imported && (
                  <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-green-700 bg-white px-1 rounded">Added</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Posts Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-marvvn-gray-400" />
        </div>
      ) : posts.length === 0 && !setupRequired ? (
        <div className="text-center py-20 bg-white border rounded-xl">
          <ImageIcon className="w-12 h-12 mx-auto text-marvvn-gray-300 mb-4" />
          <p className="text-marvvn-gray-500 mb-4">No Instagram posts yet</p>
          <p className="text-xs text-marvvn-gray-400 mb-4">Import from products above or add manually</p>
          <button
            onClick={() => { setIsAdding(true); setEditingPost({ image_url: '', caption: '', link: '', sort_order: 0, is_active: true }) }}
            className="px-4 py-2 bg-marvvn-black text-white text-sm cursor-pointer"
          >
            Add Manually
          </button>
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post, idx) => (
            <div
              key={post.id}
              className={`bg-white border rounded-xl overflow-hidden ${!post.is_active ? 'opacity-60' : ''}`}
            >
              {/* Image Preview */}
              <div className="aspect-square bg-marvvn-gray-50 relative">
                {post.image_url ? (
                  <img
                    src={post.image_url}
                    alt={post.caption || 'Instagram post'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-marvvn-gray-300" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={() => handleToggleActive(post)}
                    className={`p-1.5 rounded-full ${post.is_active ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}
                    title={post.is_active ? 'Active (click to hide)' : 'Hidden (click to show)'}
                  >
                    {post.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleReorder(post.id, 'up')}
                      disabled={idx === 0}
                      className="p-1 bg-white/80 rounded disabled:opacity-30"
                    >
                      <GripVertical className="w-3 h-3 rotate-180" />
                    </button>
                    <button
                      onClick={() => handleReorder(post.id, 'down')}
                      disabled={idx === posts.length - 1}
                      className="p-1 bg-white/80 rounded disabled:opacity-30"
                    >
                      <GripVertical className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                    title="Delete post"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Post Info */}
              <div className="p-3 space-y-2">
                <p className="text-xs text-marvvn-gray-500 truncate">
                  {post.caption || 'No caption'}
                </p>
                {post.link && (
                  <a
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-marvvn-black flex items-center gap-1 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {post.link.length > 30 ? post.link.slice(0, 30) + '...' : post.link}
                  </a>
                )}
                <div className="flex items-center justify-between pt-2 border-t">
                  <button
                    onClick={() => { setEditingPost(post); setIsAdding(false) }}
                    className="text-xs text-marvvn-black underline hover:no-underline cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-xs text-red-500 hover:text-red-700 cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function PostForm({
  post,
  onSave,
  onCancel,
  saving,
}: {
  post: Partial<InstagramPost> | null
  onSave: (post: Partial<InstagramPost>) => void
  onCancel: () => void
  saving: boolean
}) {
  const [form, setForm] = useState({
    image_url: post?.image_url || '',
    caption: post?.caption || '',
    link: post?.link || '',
    sort_order: post?.sort_order || 0,
    is_active: post?.is_active !== false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...post, ...form })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 space-y-4">
      <h3 className="font-medium">{post?.id ? 'Edit Post' : 'Add New Post'}</h3>

      <div>
        <label className="block text-sm font-medium mb-1">Image URL *</label>
        <input
          type="url"
          value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          placeholder="https://..."
          className="w-full px-3 py-2 border border-marvvn-gray-300 text-sm focus:outline-none focus:border-marvvn-black"
          required
        />
        <p className="text-xs text-marvvn-gray-400 mt-1">Paste the image URL from Instagram or upload to your server</p>
      </div>

      {form.image_url && (
        <div className="aspect-square w-32 bg-marvvn-gray-50 rounded overflow-hidden">
          <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Caption</label>
        <input
          type="text"
          value={form.caption}
          onChange={(e) => setForm({ ...form, caption: e.target.value })}
          placeholder="Optional caption"
          className="w-full px-3 py-2 border border-marvvn-gray-300 text-sm focus:outline-none focus:border-marvvn-black"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Link URL</label>
        <input
          type="url"
          value={form.link}
          onChange={(e) => setForm({ ...form, link: e.target.value })}
          placeholder="https://instagram.com/p/..."
          className="w-full px-3 py-2 border border-marvvn-gray-300 text-sm focus:outline-none focus:border-marvvn-black"
        />
        <p className="text-xs text-marvvn-gray-400 mt-1">Where users go when they click this post</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Sort Order</label>
          <input
            type="number"
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-marvvn-gray-300 text-sm focus:outline-none focus:border-marvvn-black"
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">Active (show on site)</span>
          </label>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || !form.image_url}
          className="flex items-center gap-2 px-4 py-2 bg-marvvn-black text-white text-sm font-medium hover:bg-marvvn-gray-800 disabled:opacity-50 cursor-pointer"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {post?.id ? 'Update' : 'Create'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border text-sm hover:bg-marvvn-gray-50 cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
