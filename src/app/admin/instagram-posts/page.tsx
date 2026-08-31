'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, GripVertical, Save, Eye, EyeOff, ExternalLink, Loader2, Image as ImageIcon } from 'lucide-react'

interface InstagramPost {
  id: string
  image_url: string
  caption: string
  link: string
  sort_order: number
  is_active: boolean
  created_at: string
}

export default function InstagramPostsPage() {
  const [posts, setPosts] = useState<InstagramPost[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingPost, setEditingPost] = useState<Partial<InstagramPost> | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/instagram-posts')
      const data = await res.json()
      setPosts(data.posts || [])
    } catch {}
    setLoading(false)
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
    } catch {}
  }

  const handleToggleActive = async (post: InstagramPost) => {
    await handleSave({ ...post, is_active: !post.is_active })
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-medium">Instagram Feed Posts</h1>
          <p className="text-sm text-marvvn-gray-500 mt-1">Manage which posts appear on your homepage Instagram section</p>
        </div>
        <button
          onClick={() => { setIsAdding(true); setEditingPost({ image_url: '', caption: '', link: '', sort_order: posts.length, is_active: true }) }}
          className="flex items-center gap-2 px-4 py-2 bg-marvvn-black text-white text-sm font-medium hover:bg-marvvn-gray-800 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Post
        </button>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingPost) && (
        <PostForm
          post={editingPost}
          onSave={handleSave}
          onCancel={() => { setEditingPost(null); setIsAdding(false) }}
          saving={saving}
        />
      )}

      {/* Posts Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-marvvn-gray-400" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 bg-white border rounded-xl">
          <ImageIcon className="w-12 h-12 mx-auto text-marvvn-gray-300 mb-4" />
          <p className="text-marvvn-gray-500 mb-4">No Instagram posts yet</p>
          <button
            onClick={() => { setIsAdding(true); setEditingPost({ image_url: '', caption: '', link: '', sort_order: 0, is_active: true }) }}
            className="px-4 py-2 bg-marvvn-black text-white text-sm cursor-pointer"
          >
            Add Your First Post
          </button>
        </div>
      ) : (
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
                <div className="absolute bottom-2 left-2 right-2 flex justify-between">
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
                    className="text-xs text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
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
