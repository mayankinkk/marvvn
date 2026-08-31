'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ChevronRight, Eye, EyeOff, Lock } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [validToken, setValidToken] = useState<boolean | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')
    if (!code) {
      setValidToken(false)
    } else {
      setValidToken(true)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: searchParams.get('code'),
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to reset password. The link may have expired.')
      } else {
        setSuccess('Password reset successful! Redirecting to login...')
        setTimeout(() => router.push('/account/login'), 2000)
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
          <span className="text-marvvn-black">Reset Password</span>
        </nav>

        <div className="max-w-md mx-auto">
          <h1 className="text-2xl lg:text-3xl font-display font-medium text-center mb-2">Reset Password</h1>
          <p className="text-sm text-marvvn-gray-500 text-center mb-8">Enter your new password</p>

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

          {validToken === false && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-sm text-red-700">
              Invalid or missing reset link. Please request a new one.
            </div>
          )}

          {validToken && !success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-marvvn-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-10 pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-marvvn-gray-400 hover:text-marvvn-black"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-marvvn-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 disabled:opacity-50"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link href="/account/login" className="text-sm text-marvvn-gray-500 hover:text-marvvn-black">
              Back to Sign In
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
