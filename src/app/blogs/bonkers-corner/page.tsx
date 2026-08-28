'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { blogPosts as defaultBlogPosts } from '@/lib/data'
import { ChevronRight } from 'lucide-react'

interface BlogPost {
  id: string
  handle: string
  title: string
  excerpt: string
  image: string
  date: string
  author: string
  tags: string[]
  created_at?: string
}

export default function BlogListingPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/blogs')
      .then((res) => res.json())
      .then((data) => {
        if (data.blogs && data.blogs.length > 0) {
          setPosts(data.blogs.map((b: any) => ({
            ...b,
            date: new Date(b.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          })))
        } else {
          setPosts(defaultBlogPosts)
        }
        setLoading(false)
      })
      .catch(() => {
        setPosts(defaultBlogPosts)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container py-8 lg:py-12">
          <nav className="flex items-center gap-2 text-xs text-marvvn-gray-500 mb-6">
            <Link href="/" className="hover:text-marvvn-black">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-marvvn-black">Blogs</span>
          </nav>
          <h1 className="text-2xl lg:text-3xl font-display font-medium mb-8">Our Blog</h1>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[16/9] bg-marvvn-gray-200" />
                <div className="p-4">
                  <div className="h-3 bg-marvvn-gray-200 w-20 mb-2" />
                  <div className="h-4 bg-marvvn-gray-200 w-3/4 mb-2" />
                  <div className="h-3 bg-marvvn-gray-200 w-full" />
                </div>
              </div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8 lg:py-12">
        <nav className="flex items-center gap-2 text-xs text-marvvn-gray-500 mb-6">
          <Link href="/" className="hover:text-marvvn-black">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-marvvn-black">Blogs</span>
        </nav>

        <h1 className="text-2xl lg:text-3xl font-display font-medium mb-8">Our Blog</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blogs/bonkers-corner/${post.handle}`}
              className="group border hover:shadow-lg transition-shadow"
            >
              <div className="aspect-[16/9] bg-marvvn-gray-50 overflow-hidden relative">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <p className="text-xs text-marvvn-gray-400 mb-2">{post.date}</p>
                <h2 className="text-sm font-medium group-hover:text-marvvn-gray-600 transition-colors line-clamp-2 mb-2">
                  {post.title}
                </h2>
                <p className="text-xs text-marvvn-gray-500 line-clamp-2">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
