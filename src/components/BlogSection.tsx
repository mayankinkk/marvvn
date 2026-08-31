'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import { blogPosts as defaultBlogPosts } from '@/lib/data'

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

export default function BlogSection() {
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
      <section className="py-12 lg:py-20">
        <div className="container">
          <div className="flex items-end justify-between mb-8 lg:mb-12">
            <div>
              <p className="text-sm text-marvvn-gray-500 uppercase tracking-wider mb-2">Latest News</p>
              <h2 className="section-title">Hot off the press: All the latest news in fashion</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[16/9] bg-marvvn-gray-200 mb-4" />
                <div className="h-3 bg-marvvn-gray-200 w-20 mb-2" />
                <div className="h-4 bg-marvvn-gray-200 w-3/4 mb-2" />
                <div className="h-3 bg-marvvn-gray-200 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 lg:py-20">
      <div className="container">
        <div className="flex items-end justify-between mb-8 lg:mb-12">
          <div>
            <p className="text-sm text-marvvn-gray-500 uppercase tracking-wider mb-2">Latest News</p>
            <h2 className="section-title">Hot off the press: All the latest news in fashion</h2>
          </div>
            <Link
            href="/blogs"
            className="hidden md:inline-flex items-center gap-1 text-sm font-medium hover:text-marvvn-gray-600 transition-colors"
          >
            View all posts <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {posts.slice(0, 3).map((post) => (
            <Link key={post.id} href={`/blogs/${post.handle}`} className="group">
              <div className="aspect-[16/9] bg-marvvn-gray-100 mb-4 overflow-hidden relative">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <p className="text-xs text-marvvn-gray-500 mb-2">{post.date}</p>
              <h3 className="text-base font-medium mb-2 group-hover:text-marvvn-gray-600 transition-colors line-clamp-2">
                {post.title}
              </h3>
              <p className="text-sm text-marvvn-gray-500 line-clamp-2 mb-3">
                {post.excerpt}
              </p>
              <span className="text-sm font-medium underline underline-offset-4 hover:text-marvvn-gray-600 transition-colors">
                Read more
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center md:hidden">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-1 text-sm font-medium"
          >
            View all posts <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
