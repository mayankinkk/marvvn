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
      .select('title, description')
      .eq('handle', handle)
      .single()

    if (!product) {
      return { title: 'Product Not Found | MARVVN' }
    }

    return {
      title: `${product.title} | MARVVN`,
      description: product.description,
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
