'use client'

import { ErrorBoundary } from '@/components/ErrorBoundary'

export function PageErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="text-center max-w-lg">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-3">Page Error</h1>
            <p className="text-gray-600 mb-8">
              This page encountered an error. You can try refreshing or return to the homepage.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Refresh Page
              </button>
              <a
                href="/"
                className="px-6 py-3 border border-black text-black text-sm font-medium hover:bg-black hover:text-white transition-colors"
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}
