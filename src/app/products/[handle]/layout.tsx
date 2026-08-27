import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

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
  return <>{children}</>
}
