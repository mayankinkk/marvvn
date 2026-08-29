'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Image from 'next/image'

interface Blog {
  id: string
  handle: string
  title: string
  excerpt: string
  content: string
  image: string
  author: string
  tags: string[]
  category: string
  published: boolean
  created_at: string
  meta_title?: string
  meta_description?: string
}

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    fetch('/api/blogs')
      .then(res => res.json())
      .then(data => { setBlogs(data.blogs || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = selectedCategory
    ? blogs.filter(b => b.category === selectedCategory)
    : blogs

  const categories = [...new Set(blogs.map(b => b.category).filter(Boolean))]

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8 lg:py-16">
        <h1 className="text-3xl lg:text-4xl font-display font-medium text-center mb-2">The MARVVN Blog</h1>
        <p className="text-center text-marvvn-gray-500 mb-8">Style tips, brand stories, and streetwear culture</p>

        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 text-sm rounded-full transition-colors cursor-pointer ${!selectedCategory ? 'bg-marvvn-black text-white' : 'bg-marvvn-gray-100 text-marvvn-gray-600 hover:bg-marvvn-gray-200'}`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-sm rounded-full capitalize transition-colors cursor-pointer ${selectedCategory === cat ? 'bg-marvvn-black text-white' : 'bg-marvvn-gray-100 text-marvvn-gray-600 hover:bg-marvvn-gray-200'}`}
              >
                {cat.replace(/-/g, ' ')}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-marvvn-gray-100 mb-3" />
                <div className="h-4 bg-marvvn-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-marvvn-gray-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-marvvn-gray-500 py-12">No blog posts yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(blog => (
              <Link key={blog.id} href={`/blog/${blog.handle}`} className="group">
                <div className="aspect-video bg-marvvn-gray-50 overflow-hidden mb-3 relative">
                  <Image src={blog.image} alt={blog.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="flex items-center gap-2 text-xs text-marvvn-gray-400 mb-2">
                  {blog.category && <span className="capitalize">{blog.category.replace(/-/g, ' ')}</span>}
                  <span>·</span>
                  <span>{new Date(blog.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <h2 className="font-medium group-hover:underline mb-1">{blog.title}</h2>
                <p className="text-sm text-marvvn-gray-500 line-clamp-2">{blog.excerpt}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
