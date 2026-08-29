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
    const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
    const restUrl = `${supabaseUrl}/rest/v1/store_settings?key=eq.maintenance_mode&select=value`

    const res = await fetch(restUrl, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    })

    if (res.ok) {
      const rows = await res.json()
      const maintenanceValue = rows?.[0]?.value

      if (maintenanceValue === 'true') {
        const sessionCookie = request.cookies.get(`sb-${projectRef}-auth-token`)

        if (!sessionCookie) {
          const maintenanceUrl = request.nextUrl.clone()
          maintenanceUrl.pathname = '/maintenance'
          return NextResponse.rewrite(maintenanceUrl)
        }
      }
    }
  } catch {
    // Settings fetch failed — continue navigation normally
  }

  return NextResponse.next()
}
