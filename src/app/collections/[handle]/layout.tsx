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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marvvn.online'

  return {
    title: `${title} | MARVVN`,
    description: collection?.description || `Shop ${title} at MARVVN`,
    alternates: {
      canonical: `${baseUrl}/collections/${handle}`,
    },
  }
}

export default function CollectionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
