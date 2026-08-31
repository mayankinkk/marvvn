'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Plus, Trash2, ToggleLeft, ToggleRight, X, Pencil, Upload, Loader2, Bold, Italic, Heading1, List, Link2, ImageIcon, Quote, Code, Eye, Edit3 } from 'lucide-react'

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
  category: string | null
  created_at: string
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Blog | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [editorMode, setEditorMode] = useState<'write' | 'preview'>('write')
  const [blogCategories, setBlogCategories] = useState<{ slug: string; label: string }[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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

    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        try {
          const cats = JSON.parse(data.settings?.blog_categories || '[]')
          if (Array.isArray(cats)) setBlogCategories(cats)
        } catch {}
      })
      .catch(() => {})
  }, [])

  const resetForm = () => {
    setForm({ handle: '', title: '', excerpt: '', content: '', image: '', author: 'MARVVN', tags: '', category: '', published: true })
    setEditing(null)
    setEditorMode('write')
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
      category: blog.category || '',
      published: blog.published,
    })
    setEditing(blog)
    setShowForm(true)
    setEditorMode('write')
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
      const method = editing ? 'PUT' : 'POST'
      const body = editing ? { ...payload, id: editing.id } : payload

      const res = await fetch('/api/admin/blogs', {
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

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'blogs')
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      if (res.ok) {
        const data = await res.json()
        setForm({ ...form, image: data.url })
      }
    } catch {}
    setUploadingImage(false)
  }

  const insertMarkdown = useCallback((prefix: string, suffix: string = '', placeholder: string = '') => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = form.content.substring(start, end) || placeholder
    const newText = form.content.substring(0, start) + prefix + selected + suffix + form.content.substring(end)
    setForm(f => ({ ...f, content: newText }))
    setTimeout(() => {
      ta.focus()
      const newCursorPos = start + prefix.length + selected.length
      ta.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }, [form.content])

  const renderMarkdownPreview = (md: string): string => {
    if (!md) return '<p class="text-gray-400 italic">Nothing to preview</p>'
    let html = md
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-5 mb-2">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-3">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 py-0.5 text-sm rounded">$1</code>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full my-3 rounded" />')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="underline text-blue-600">$1</a>')
      .replace(/^&gt; (.+)$/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-2">$1</blockquote>')
      .replace(/^[-*] (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal">$2</li>')
      .replace(/(<li[^>]*>.*<\/li>\n?)+/g, (match) => `<ul class="my-2">${match}</ul>`)
      .replace(/\n{2,}/g, '</p><p class="my-2">')
      .replace(/\n/g, '<br/>')
    return `<div class="prose prose-sm max-w-none">${html}</div>`
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

            {/* Rich Text Editor */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium">Content</label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditorMode('write')}
                    className={`flex items-center gap-1 px-2 py-1 text-xs rounded cursor-pointer ${editorMode === 'write' ? 'bg-marvvn-black text-white' : 'bg-marvvn-gray-100 text-marvvn-gray-600 hover:bg-marvvn-gray-200'}`}
                  >
                    <Edit3 className="w-3 h-3" /> Write
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode('preview')}
                    className={`flex items-center gap-1 px-2 py-1 text-xs rounded cursor-pointer ${editorMode === 'preview' ? 'bg-marvvn-black text-white' : 'bg-marvvn-gray-100 text-marvvn-gray-600 hover:bg-marvvn-gray-200'}`}
                  >
                    <Eye className="w-3 h-3" /> Preview
                  </button>
                </div>
              </div>

              {editorMode === 'write' && (
                <>
                  {/* Toolbar */}
                  <div className="flex items-center gap-0.5 p-1.5 border border-b-0 border-marvvn-gray-200 bg-marvvn-gray-50 rounded-t">
                    <button type="button" onClick={() => insertMarkdown('**', '**', 'bold text')} className="p-1.5 hover:bg-white rounded cursor-pointer" title="Bold"><Bold className="w-4 h-4" /></button>
                    <button type="button" onClick={() => insertMarkdown('*', '*', 'italic text')} className="p-1.5 hover:bg-white rounded cursor-pointer" title="Italic"><Italic className="w-4 h-4" /></button>
                    <button type="button" onClick={() => insertMarkdown('## ', '', 'Heading')} className="p-1.5 hover:bg-white rounded cursor-pointer" title="Heading"><Heading1 className="w-4 h-4" /></button>
                    <div className="w-px h-5 bg-marvvn-gray-200 mx-1" />
                    <button type="button" onClick={() => insertMarkdown('- ', '', 'list item')} className="p-1.5 hover:bg-white rounded cursor-pointer" title="Bullet List"><List className="w-4 h-4" /></button>
                    <button type="button" onClick={() => insertMarkdown('> ', '', 'quote')} className="p-1.5 hover:bg-white rounded cursor-pointer" title="Quote"><Quote className="w-4 h-4" /></button>
                    <button type="button" onClick={() => insertMarkdown('`', '`', 'code')} className="p-1.5 hover:bg-white rounded cursor-pointer" title="Inline Code"><Code className="w-4 h-4" /></button>
                    <div className="w-px h-5 bg-marvvn-gray-200 mx-1" />
                    <button type="button" onClick={() => insertMarkdown('[', '](url)', 'link text')} className="p-1.5 hover:bg-white rounded cursor-pointer" title="Link"><Link2 className="w-4 h-4" /></button>
                    <button type="button" onClick={() => insertMarkdown('![alt](', ')', 'https://image-url.jpg')} className="p-1.5 hover:bg-white rounded cursor-pointer" title="Image"><ImageIcon className="w-4 h-4" /></button>
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    className="input-field w-full rounded-t-none font-mono text-sm min-h-[250px]"
                    placeholder="Write your blog content in markdown...

# Heading
## Subheading

**Bold text** and *italic text*

- Bullet list item
> Blockquote

[Link text](https://url.com)
![Image alt](https://image-url.jpg)"
                  />
                </>
              )}

              {editorMode === 'preview' && (
                <div
                  className="border border-marvvn-gray-200 rounded p-4 min-h-[250px] bg-white prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(form.content) }}
                />
              )}
            </div>

            {/* Image Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Cover Image *</label>
              <div className="space-y-2">
                {form.image ? (
                  <div className="relative group">
                    <img src={form.image} alt="" className="w-full h-48 object-cover border" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <label className="px-3 py-1.5 bg-white text-sm font-medium cursor-pointer hover:bg-marvvn-gray-100">
                        Replace
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f) }} />
                      </label>
                      <button type="button" onClick={() => setForm({ ...form, image: '' })} className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium hover:bg-red-700 cursor-pointer">
                        Remove
                      </button>
                    </div>
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                    )}
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-marvvn-gray-300 hover:border-marvvn-black transition-colors cursor-pointer">
                    {uploadingImage ? (
                      <Loader2 className="w-6 h-6 animate-spin text-marvvn-gray-400" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-marvvn-gray-400 mb-2" />
                        <span className="text-sm text-marvvn-gray-500">Click to upload cover image</span>
                        <span className="text-xs text-marvvn-gray-400">JPG, PNG, WebP (max 10MB)</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f) }} />
                  </label>
                )}
                <input
                  type="text"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="input-field text-xs"
                  placeholder="Or paste image URL"
                />
              </div>
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
                {blogCategories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>{cat.label}</option>
                ))}
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
