import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-16 lg:py-24 text-center">
        <h1 className="text-6xl lg:text-8xl font-display font-bold text-marvvn-gray-200 mb-4">404</h1>
        <h2 className="text-xl lg:text-2xl font-display font-medium mb-4">Page Not Found</h2>
        <p className="text-marvvn-gray-500 mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" className="btn-primary">
          Back to Home
        </Link>
      </main>
      <Footer />
    </div>
  )
}
