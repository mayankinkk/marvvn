import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const config = {
  matcher: ['/((?!_next/static|_next/image|api|admin|favicon.ico|robots.txt|sitemap.xml|placeholder.png|maintenance).*)'],
}

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next()
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', 'maintenance_mode')
      .single()

    if (data?.value === 'true') {
      const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
      const sessionCookie = request.cookies.get(`sb-${projectRef}-auth-token`)

      if (!sessionCookie) {
        const maintenanceUrl = request.nextUrl.clone()
        maintenanceUrl.pathname = '/maintenance'
        return NextResponse.rewrite(maintenanceUrl)
      }
    }
  } catch {
    // Settings fetch failed — continue navigation normally
  }

  return NextResponse.next()
}
