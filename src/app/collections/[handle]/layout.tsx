import { Metadata } from 'next'
import { collections } from '@/lib/data'

export async function generateStaticParams() {
  return collections.map((collection) => ({
    handle: collection.handle,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params
  const collection = collections.find((c) => c.handle === handle)
  const title = collection?.title || handle.replace(/-/g, ' ')
  return {
    title: `${title} | MARVNN`,
    description: collection?.description || `Shop ${title} at MARVNN`,
  }
}

export default function CollectionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
