'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { blogPosts as defaultBlogPosts } from '@/lib/data'
import { ChevronRight } from 'lucide-react'

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

function renderMarkdown(md: string): string {
  if (!md) return ''
  return md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-6 mb-3 text-marvvn-black">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-8 mb-3 text-marvvn-black">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-10 mb-4 text-marvvn-black">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-marvvn-black">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-marvvn-gray-100 px-1.5 py-0.5 text-sm rounded font-mono">$1</code>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full my-4 rounded" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="underline text-marvvn-black hover:text-marvvn-gray-600 transition-colors">$1</a>')
    .replace(/^&gt; (.+)$/gm, '<blockquote class="border-l-4 border-marvvn-gray-300 pl-4 italic text-marvvn-gray-500 my-3">$1</blockquote>')
    .replace(/^[-*] (.+)$/gm, '<li class="ml-4 list-disc text-marvvn-gray-600 leading-relaxed">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal text-marvvn-gray-600 leading-relaxed">$2</li>')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, (match) => `<ul class="my-3 space-y-1">${match}</ul>`)
    .replace(/\n{2,}/g, '</p><p class="my-3 text-marvvn-gray-600 leading-relaxed">')
    .replace(/\n/g, '<br/>')
}

export default function BlogPostPage() {
  const params = useParams()
  const handle = params.handle as string
  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/blogs')
      .then((res) => res.json())
      .then((data) => {
        const allPosts = (data.blogs || []).map((b: any) => ({
          ...b,
          date: new Date(b.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        }))
        
        const found = allPosts.find((p: BlogPost) => p.handle === handle)
        if (found) {
          setPost(found)
          const related = allPosts
            .filter((p: BlogPost) => p.handle !== handle)
            .sort((a: BlogPost, b: BlogPost) => {
              const aMatch = a.category === found.category || a.tags.some(t => found.tags.includes(t)) ? 1 : 0
              const bMatch = b.category === found.category || b.tags.some(t => found.tags.includes(t)) ? 1 : 0
              return bMatch - aMatch
            })
            .slice(0, 2)
          setRelatedPosts(related)
        } else {
          const fallback = defaultBlogPosts.find((p) => p.handle === handle)
          if (fallback) {
            setPost(fallback)
            setRelatedPosts(defaultBlogPosts.filter((p) => p.handle !== handle).slice(0, 2))
          }
        }
        setLoading(false)
      })
      .catch(() => {
        const fallback = defaultBlogPosts.find((p) => p.handle === handle)
        if (fallback) {
          setPost(fallback)
          setRelatedPosts(defaultBlogPosts.filter((p) => p.handle !== handle).slice(0, 2))
        }
        setLoading(false)
      })
  }, [handle])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-marvvn-black border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <Link href="/blogs" className="btn-primary">Back to Blog</Link>
        </div>
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
          <Link href="/blogs" className="hover:text-marvvn-black">Blogs</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-marvvn-black truncate">{post.title}</span>
        </nav>

        <article className="max-w-3xl mx-auto">
          <div className="aspect-[16/9] bg-marvvn-gray-50 overflow-hidden mb-6 relative">
            <Image
              src={post.image}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>

          <div className="flex items-center gap-4 text-xs text-marvvn-gray-400 mb-4">
            <span>{post.date}</span>
            <span>By {post.author}</span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-display font-medium mb-6">{post.title}</h1>

          <div className="prose prose-sm max-w-none">
            {post.content ? (
              <div
                className="text-marvvn-gray-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
              />
            ) : (
              <>
                <p className="text-marvvn-gray-600 leading-relaxed mb-4">{post.excerpt}</p>
                <p className="text-marvvn-gray-600 leading-relaxed mb-4">
                  At MARVVN, we believe fashion should be bold, expressive, and unapologetically you. 
                  Our collections are designed for those who dare to stand out and embrace their unique style.
                </p>
                <p className="text-marvvn-gray-600 leading-relaxed mb-4">
                  From oversized tees to statement joggers, every piece is crafted with premium materials 
                  and attention to detail. Whether you&apos;re heading to a concert, a casual outing, or just 
                  lounging at home, MARVVN has got you covered.
                </p>
                <p className="text-marvvn-gray-600 leading-relaxed">
                  Stay tuned for more drops, collaborations, and style guides. Follow us on Instagram 
                  @marvvn for the latest updates and behind-the-scenes content.
                </p>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-6">
            {post.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 text-xs bg-marvvn-gray-100 text-marvvn-gray-600">
                #{tag}
              </span>
            ))}
          </div>
        </article>

        {relatedPosts.length > 0 && (
          <section className="mt-16 max-w-3xl mx-auto">
            <h2 className="text-xl font-display font-medium mb-6">You May Also Like</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {relatedPosts.map((rp) => (
                <Link
                  key={rp.id}
                  href={`/blogs/${rp.handle}`}
                  className="group border hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-[16/9] bg-marvvn-gray-50 overflow-hidden relative">
                    <Image src={rp.image} alt={rp.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-marvvn-gray-400 mb-2">{rp.date}</p>
                    <h3 className="text-sm font-medium group-hover:text-marvvn-gray-600 transition-colors line-clamp-2">
                      {rp.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}
