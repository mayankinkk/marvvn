import { Metadata } from 'next'
import { products } from '@/lib/data'

export async function generateStaticParams() {
  return products.map((product) => ({
    handle: product.handle,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params
  const product = products.find((p) => p.handle === handle)
  if (!product) {
    return { title: 'Product Not Found' }
  }
  return {
    title: `${product.title} | MARVVN`,
    description: product.description,
  }
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
