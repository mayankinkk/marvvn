import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createClient()
  const { searchParams, origin } = new URL(request.url)
  const provider = searchParams.get('provider') || 'google'
  const redirectTo = searchParams.get('redirect') || '/account'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as 'google' | 'github',
    options: {
      redirectTo: `${origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
    },
  })

  if (error) {
    return NextResponse.redirect(`${origin}/account/login?error=${encodeURIComponent(error.message)}`)
  }

  return NextResponse.redirect(data.url)
}
