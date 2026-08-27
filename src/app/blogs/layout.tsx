import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blogs | MARVNN',
  description: 'Read the latest fashion tips, styling guides, and updates from MARVNN.',
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
