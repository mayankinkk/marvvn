import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createClient()
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect') || '/account'

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split('@')[0],
        avatar_url: data.user.user_metadata?.avatar_url || null,
      }, { onConflict: 'id' })
      
      const response = NextResponse.redirect(`${origin}${redirect}`)
      return response
    }
  }

  return NextResponse.redirect(`${origin}/account/login?error=auth_failed`)
}
