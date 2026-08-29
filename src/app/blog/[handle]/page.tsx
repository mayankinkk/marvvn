import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import type { Metadata } from 'next'

async function getBlog(handle: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://marvvn.online'}/api/blogs`, { cache: 'no-store' })
  const data = await res.json()
  return (data.blogs || []).find((b: any) => b.handle === handle)
}

export async function generateMetadata({ params }: { params: { handle: string } }): Promise<Metadata> {
  const blog = await getBlog(params.handle)
  if (!blog) return { title: 'Blog Post Not Found' }
  return {
    title: blog.meta_title || `${blog.title} | MARVVN Blog`,
    description: blog.meta_description || blog.excerpt,
    openGraph: { title: blog.title, description: blog.excerpt, images: blog.image ? [blog.image] : [] },
  }
}

export default async function BlogPostPage({ params }: { params: { handle: string } }) {
  const blog = await getBlog(params.handle)
  if (!blog) notFound()

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8 lg:py-16 max-w-3xl">
        <nav className="flex items-center gap-2 text-xs text-marvvn-gray-500 mb-6">
          <Link href="/" className="hover:text-marvvn-black">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-marvvn-black">Blog</Link>
          <span>/</span>
          <span className="text-marvvn-black truncate">{blog.title}</span>
        </nav>

        {blog.category && (
          <span className="inline-block px-3 py-1 text-xs bg-marvvn-gray-100 text-marvvn-gray-600 rounded-full mb-4 capitalize">
            {blog.category.replace(/-/g, ' ')}
          </span>
        )}

        <h1 className="text-3xl lg:text-4xl font-display font-medium mb-4">{blog.title}</h1>

        <div className="flex items-center gap-3 text-sm text-marvvn-gray-500 mb-8">
          <span>{blog.author}</span>
          <span>·</span>
          <time>{new Date(blog.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
        </div>

        {blog.image && (
          <div className="aspect-video bg-marvvn-gray-50 overflow-hidden mb-8 relative">
            <Image src={blog.image} alt={blog.title} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" priority />
          </div>
        )}

        {blog.content && (
          <div className="prose prose-lg max-w-none">
            {blog.content.split('\n').map((paragraph: string, i: number) => (
              paragraph.trim() ? <p key={i} className="text-marvvn-gray-700 leading-relaxed mb-4">{paragraph}</p> : null
            ))}
          </div>
        )}

        {blog.tags && blog.tags.length > 0 && (
          <div className="mt-8 pt-6 border-t flex flex-wrap gap-2">
            {blog.tags.map((tag: string) => (
              <span key={tag} className="px-3 py-1 text-xs bg-marvvn-gray-100 text-marvvn-gray-600 rounded-full">{tag}</span>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
