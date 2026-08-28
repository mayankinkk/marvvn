'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, ToggleLeft, ToggleRight, X, Pencil } from 'lucide-react'

interface Blog {
  id: string
  handle: string
  title: string
  excerpt: string
  content: string
  image: string
  author: string
  tags: string[]
  published: boolean
  created_at: string
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Blog | null>(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    handle: '',
    title: '',
    excerpt: '',
    content: '',
    image: '',
    author: 'MARVVN',
    tags: '',
    category: '',
    published: true,
  })

  useEffect(() => {
    fetch('/api/admin/blogs')
      .then((res) => res.json())
      .then((data) => { setBlogs(data.blogs || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const resetForm = () => {
    setForm({ handle: '', title: '', excerpt: '', content: '', image: '', author: 'MARVVN', tags: '', category: '', published: true })
    setEditing(null)
  }

  const handleEdit = (blog: Blog) => {
    setForm({
      handle: blog.handle,
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content || '',
      image: blog.image,
      author: blog.author,
      tags: blog.tags.join(', '),
      category: (blog as any).category || '',
      published: blog.published,
    })
    setEditing(blog)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      category: form.category || null,
    }

    try {
      const url = editing ? '/api/admin/blogs' : '/api/admin/blogs'
      const method = editing ? 'PUT' : 'POST'
      const body = editing ? { ...payload, id: editing.id } : payload

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const data = await res.json()
        if (editing) {
          setBlogs(blogs.map(b => b.id === editing.id ? { ...b, ...data.blog } : b))
        } else {
          setBlogs([data.blog, ...blogs])
        }
        setShowForm(false)
        resetForm()
      }
    } catch {}
    setSaving(false)
  }

  const togglePublished = async (blog: Blog) => {
    await fetch('/api/admin/blogs', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: blog.id, published: !blog.published }),
    })
    setBlogs(blogs.map(b => b.id === blog.id ? { ...b, published: !b.published } : b))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this blog post?')) return
    const res = await fetch(`/api/admin/blogs?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      setBlogs(blogs.filter(b => b.id !== id))
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
          <h1 className="text-2xl font-display font-medium">Blog Posts</h1>
          <p className="text-sm text-marvvn-gray-500 mt-1">{blogs.length} total posts</p>
        </div>
        <button
          type="button"
          onClick={() => { resetForm(); setShowForm(true) }}
          className="btn-primary flex items-center gap-2 text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Post
        </button>
      </div>

      {showForm && (
        <div className="bg-white border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium">{editing ? 'Edit Post' : 'New Post'}</h2>
            <button type="button" onClick={() => { setShowForm(false); resetForm() }} className="cursor-pointer"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Handle (slug) *</label>
              <input
                type="text"
                value={form.handle}
                onChange={(e) => setForm({ ...form, handle: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })}
                className="input-field font-mono"
                required
                placeholder="my-blog-post"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Excerpt *</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                className="input-field"
                rows={2}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Content</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="input-field"
                rows={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Image URL *</label>
              <input
                type="url"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Author</label>
              <input
                type="text"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="input-field"
                placeholder="fashion, style, tips"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input-field"
              >
                <option value="">Select category</option>
                <option value="style-guide">Style Guide</option>
                <option value="brand-story">Brand Story</option>
                <option value="streetwear">Streetwear</option>
                <option value="behind-the-scenes">Behind the Scenes</option>
                <option value="collaborations">Collaborations</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="published"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="published" className="text-sm">Published</label>
            </div>
            <div className="md:col-span-2">
              <button type="submit" disabled={saving} className="btn-primary px-6 py-2 text-sm cursor-pointer disabled:opacity-50">
                {saving ? 'Saving...' : editing ? 'Update Post' : 'Create Post'}
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
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium">Handle</th>
                <th className="px-6 py-3 font-medium">Author</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-marvvn-gray-400">No blog posts yet.</td></tr>
              ) : (
                blogs.map((blog) => (
                  <tr key={blog.id} className="border-b last:border-0 hover:bg-marvvn-gray-50">
                    <td className="px-6 py-3 font-medium max-w-xs truncate">{blog.title}</td>
                    <td className="px-6 py-3 font-mono text-xs text-marvvn-gray-500">{blog.handle}</td>
                    <td className="px-6 py-3">{blog.author}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${blog.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                        {blog.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-marvvn-gray-500">
                      {new Date(blog.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button type="button" onClick={() => handleEdit(blog)} className="p-1 hover:bg-marvvn-gray-100 rounded cursor-pointer">
                          <Pencil className="w-4 h-4 text-marvvn-gray-400" />
                        </button>
                        <button type="button" onClick={() => togglePublished(blog)} className="cursor-pointer">
                          {blog.published ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-marvvn-gray-400" />}
                        </button>
                        <button type="button" onClick={() => handleDelete(blog.id)} className="p-1 hover:bg-red-50 rounded cursor-pointer">
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
