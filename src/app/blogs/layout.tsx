import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blogs | Bonkers Corner',
  description: 'Read the latest fashion tips, styling guides, and updates from Bonkers Corner.',
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
