'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { blogPosts } from '@/lib/data'
import { ChevronRight } from 'lucide-react'

export default function BlogListingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8 lg:py-12">
        <nav className="flex items-center gap-2 text-xs text-marvnn-gray-500 mb-6">
          <Link href="/" className="hover:text-marvnn-black">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-marvnn-black">Blogs</span>
        </nav>

        <h1 className="text-2xl lg:text-3xl font-display font-medium mb-8">Our Blog</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blogs/bonkers-corner/${post.handle}`}
              className="group border hover:shadow-lg transition-shadow"
            >
              <div className="aspect-[16/9] bg-marvnn-gray-50 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <p className="text-xs text-marvnn-gray-400 mb-2">{post.date}</p>
                <h2 className="text-sm font-medium group-hover:text-marvnn-gray-600 transition-colors line-clamp-2 mb-2">
                  {post.title}
                </h2>
                <p className="text-xs text-marvnn-gray-500 line-clamp-2">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
