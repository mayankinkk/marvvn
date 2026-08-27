'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuthStore } from '@/lib/auth-store'
import { ChevronRight, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    setTimeout(() => {
      const success = login(email, password)
      if (success) {
        router.push('/account')
      } else {
        setError('Invalid email or password. Try demo@bonkers.com / demo123')
      }
      setLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8 lg:py-16">
        <nav className="flex items-center gap-2 text-xs text-bonkers-gray-500 mb-8">
          <Link href="/" className="hover:text-bonkers-black">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-bonkers-black">Login</span>
        </nav>

        <div className="max-w-md mx-auto">
          <h1 className="text-2xl lg:text-3xl font-display font-medium text-center mb-2">Welcome Back</h1>
          <p className="text-sm text-bonkers-gray-500 text-center mb-8">Sign in to your account</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-bonkers-gray-400 hover:text-bonkers-black"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-bonkers-gray-500">
              Don&apos;t have an account?{' '}
              <Link href="/account/register" className="text-bonkers-black font-medium hover:underline">
                Create one
              </Link>
            </p>
          </div>

          <div className="mt-8 p-4 bg-bonkers-gray-50 text-center text-sm text-bonkers-gray-500">
            <p className="font-medium text-bonkers-gray-700 mb-1">Demo Credentials</p>
            <p>Email: demo@bonkers.com</p>
            <p>Password: demo123</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
