import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blogs | MARVVN',
  description: 'Read the latest fashion tips, styling guides, and updates from MARVVN.',
  alternates: {
    types: {
      'application/rss+xml': [{ title: 'MARVVN Blog', url: '/feed.xml' }],
    },
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
