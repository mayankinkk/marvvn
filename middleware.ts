import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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
    const restUrl = `${supabaseUrl}/rest/v1/store_settings?key=eq.maintenance_mode&select=value`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)

    const res = await fetch(restUrl, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (res.ok) {
      const rows = await res.json()
      const maintenanceValue = rows?.[0]?.value

      if (maintenanceValue === 'true') {
        const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
        const sessionCookie = request.cookies.get(`sb-${projectRef}-auth-token`)

        if (!sessionCookie) {
          return NextResponse.rewrite(new URL('/maintenance', request.url))
        }
      }
    }
  } catch {
    // Settings fetch failed — continue navigation normally
  }

  return NextResponse.next()
}
