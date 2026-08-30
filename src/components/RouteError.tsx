'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-display font-medium mb-2">Something went wrong</h1>
          <p className="text-sm text-marvvn-gray-500 mb-6">
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={reset}
              className="px-6 py-3 bg-marvvn-black text-white text-sm font-medium hover:bg-marvvn-gray-800 transition-colors cursor-pointer"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="px-6 py-3 border border-marvvn-gray-300 text-sm font-medium hover:bg-marvvn-gray-50 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
