import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function sanitizeRedirect(redirect: string | null): string {
  const path = redirect || '/account'
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('://') || path.includes('\n') || path.includes('\r')) {
    return '/account'
  }
  return path
}

export async function GET(request: Request) {
  const supabase = createClient()
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = sanitizeRedirect(searchParams.get('redirect'))

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split('@')[0],
      }, { onConflict: 'id' })
      
      const response = NextResponse.redirect(`${origin}${redirect}`)
      return response
    }
  }

  return NextResponse.redirect(`${origin}/account/login?error=auth_failed`)
}
