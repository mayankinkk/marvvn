'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/auth-store'

export default function AuthCodeHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fetchUser = useAuthStore((s) => s.fetchUser)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const code = searchParams.get('code')
    if (!code || processing) return

    setProcessing(true)

    const supabase = createClient()

    supabase.auth.exchangeCodeForSession(code).then(async ({ data, error }) => {
      if (error) {
        console.error('Auth code exchange failed:', error.message)
        router.replace('/')
        return
      }

      if (data.user) {
        await fetch('/api/auth/sync-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split('@')[0],
            avatar_url: data.user.user_metadata?.avatar_url,
          }),
        })

        useAuthStore.setState({
          user: {
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split('@')[0] || '',
            phone: data.user.user_metadata?.phone || '',
          },
          isAuthenticated: true,
        })

        window.location.replace('/')
      } else {
        router.replace('/')
      }
    })
  }, [searchParams, router, fetchUser, processing])

  return null
}
