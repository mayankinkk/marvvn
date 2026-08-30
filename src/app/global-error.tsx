'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-display font-medium mb-2">Something went wrong</h1>
            <p className="text-sm text-marvvn-gray-500 mb-6">
              An unexpected error occurred. Please try again.
            </p>
            <button
              onClick={reset}
              className="px-6 py-3 bg-marvvn-black text-white text-sm font-medium hover:bg-marvvn-gray-800 transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
