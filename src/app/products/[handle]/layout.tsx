import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  try {
    const supabase = createClient()
    const { data: products } = await supabase.from('products').select('handle')
    return (products || []).map((product) => ({
      handle: product.handle,
    }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params
  try {
    const supabase = createClient()
    const { data: product } = await supabase
      .from('products')
      .select('title, description, images, price, category')
      .eq('handle', handle)
      .single()

    if (!product) {
      return { title: 'Product Not Found | MARVVN' }
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marvvn.online'
    const productUrl = `${baseUrl}/products/${handle}`
    const ogImage = product.images?.[0] || '/og.png'

    return {
      title: `${product.title} | MARVVN`,
      description: product.description,
      alternates: {
        canonical: productUrl,
      },
      openGraph: {
        title: product.title,
        description: product.description,
        url: productUrl,
        siteName: 'MARVVN',
        images: [
          {
            url: ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`,
            width: 1200,
            height: 630,
            alt: product.title,
          },
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: product.title,
        description: product.description,
        images: [ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`],
      },
    }
  } catch {
    return { title: 'Product | MARVVN' }
  }
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-semibold mb-2">Product Unavailable</h2>
            <p className="text-gray-600 mb-6 text-sm">
              We couldn&apos;t load this product. It may be temporarily unavailable.
            </p>
            <a href="/" className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors inline-block">
              Browse Products
            </a>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}
