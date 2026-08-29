'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { blogPosts as defaultBlogPosts } from '@/lib/data'
import { ChevronRight, Clock, User, Tag } from 'lucide-react'

interface BlogPost {
  id: string
  handle: string
  title: string
  excerpt: string
  content?: string
  image: string
  date: string
  author: string
  tags: string[]
  category?: string
  created_at?: string
}

const DEFAULT_CATEGORIES = [
  { slug: 'style-guide', label: 'Style Guide' },
  { slug: 'brand-story', label: 'Brand Story' },
  { slug: 'streetwear', label: 'Streetwear' },
  { slug: 'behind-the-scenes', label: 'Behind the Scenes' },
  { slug: 'collaborations', label: 'Collaborations' },
]

export default function BlogsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [heading, setHeading] = useState('Our Blog')
  const [subtitle, setSubtitle] = useState('Stories, style guides, and behind-the-scenes from the MARVVN world')
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)

  useEffect(() => {
    fetch('/api/blogs')
      .then((res) => res.json())
      .then((data) => {
        const allPosts = (data.blogs || []).map((b: any) => ({
          ...b,
          date: new Date(b.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        }))
        setPosts(allPosts.length > 0 ? allPosts : defaultBlogPosts)
        setLoading(false)
      })
      .catch(() => {
        setPosts(defaultBlogPosts)
        setLoading(false)
      })

    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.blog_page_heading) setHeading(data.blog_page_heading)
        if (data.blog_page_subtitle) setSubtitle(data.blog_page_subtitle)
        if (data.blog_categories) {
          try {
            const parsed = JSON.parse(data.blog_categories)
            if (Array.isArray(parsed) && parsed.length > 0) setCategories(parsed)
          } catch {}
        }
      })
      .catch(() => {})
  }, [])

  const filteredPosts = activeCategory === 'all'
    ? posts
    : posts.filter(p => p.category === activeCategory || p.tags.includes(activeCategory))

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8 lg:py-12">
        <nav className="flex items-center gap-2 text-xs text-marvvn-gray-500 mb-8">
          <Link href="/" className="hover:text-marvvn-black">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-marvvn-black">Blogs</span>
        </nav>

        <div className="text-center mb-10">
          <h1 className="text-3xl lg:text-4xl font-display font-medium mb-3">{heading}</h1>
          <p className="text-marvvn-gray-500 max-w-lg mx-auto">{subtitle}</p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-marvvn-black text-white'
                : 'bg-marvvn-gray-100 text-marvvn-gray-600 hover:bg-marvvn-gray-200'
            }`}
          >
            All Posts
          </button>
          {categories.map(cat => (
            <button
              key={cat.slug}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                activeCategory === cat.slug
                  ? 'bg-marvvn-black text-white'
                  : 'bg-marvvn-gray-100 text-marvvn-gray-600 hover:bg-marvvn-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[16/9] bg-marvvn-gray-100 mb-3" />
                <div className="h-4 bg-marvvn-gray-100 w-1/3 mb-2" />
                <div className="h-5 bg-marvvn-gray-100 w-3/4" />
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-marvvn-gray-400 mb-4">No posts in this category yet</p>
            <button onClick={() => setActiveCategory('all')} className="text-sm font-medium text-marvvn-black hover:underline cursor-pointer">
              View all posts
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blogs/${post.handle}`}
                className="group border border-marvvn-gray-100 hover:shadow-lg transition-all duration-300"
              >
                <div className="aspect-[16/9] bg-marvvn-gray-50 overflow-hidden relative">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {post.category && (
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider">
                      {post.category.replace('-', ' ')}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-3 text-[11px] text-marvvn-gray-400 mb-2">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.date}</span>
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author}</span>
                  </div>
                  <h2 className="text-sm font-medium group-hover:text-marvvn-gray-600 transition-colors line-clamp-2 mb-2">
                    {post.title}
                  </h2>
                  <p className="text-xs text-marvvn-gray-500 line-clamp-2">{post.excerpt}</p>
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {post.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] text-marvvn-gray-400 bg-marvvn-gray-50 px-2 py-0.5">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
