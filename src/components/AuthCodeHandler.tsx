'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/auth-store'

export default function AuthCodeHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fetchUser = useAuthStore((s) => s.fetchUser)

  useEffect(() => {
    const code = searchParams.get('code')
    if (!code) return

    const supabase = createClient()
    supabase.auth.exchangeCodeForSession(code).then(async ({ error }) => {
      if (!error) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await fetch('/api/auth/sync-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
              avatar_url: user.user_metadata?.avatar_url,
            }),
          })
          await fetchUser()
        }
      }
      router.replace('/')
    })
  }, [searchParams, router, fetchUser])

  return null
}
