'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ChevronRight, Mail, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
      } else {
        setSuccess('Password reset link sent! Check your email inbox.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8 lg:py-16">
        <nav className="flex items-center gap-2 text-xs text-marvvn-gray-500 mb-8">
          <Link href="/" className="hover:text-marvvn-black">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/account/login" className="hover:text-marvvn-black">Login</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-marvvn-black">Forgot Password</span>
        </nav>

        <div className="max-w-md mx-auto">
          <h1 className="text-2xl lg:text-3xl font-display font-medium text-center mb-2">Forgot Password</h1>
          <p className="text-sm text-marvvn-gray-500 text-center mb-8">
            Enter your email and we&apos;ll send you a reset link
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-sm text-green-700">
              {success}
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-marvvn-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/account/login"
              className="inline-flex items-center gap-1 text-sm text-marvvn-gray-500 hover:text-marvvn-black"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
