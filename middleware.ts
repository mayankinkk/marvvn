import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: ['/((?!_next/static|_next/image|api/settings|api/auth|api/admin|favicon.ico|robots.txt|sitemap.xml|placeholder.png).*)'],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  try {
    const url = request.nextUrl.clone()
    url.pathname = '/api/settings'

    // Use a short timeout so slow Supabase responses never block navigation
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 500)

    const settingsRes = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 60 },
    })
    clearTimeout(timeoutId)

    if (settingsRes.ok) {
      const settings = await settingsRes.json()
      if (settings.maintenance_mode === true || settings.maintenance_mode === 'true') {
        const sessionCookie = request.cookies.get('sb-vowubjguzgdbaircgdwq-auth-token')
        if (!sessionCookie) {
          const maintenanceUrl = request.nextUrl.clone()
          maintenanceUrl.pathname = '/maintenance'
          return NextResponse.rewrite(maintenanceUrl)
        }
      }
    }
  } catch {
    // Settings fetch failed or timed out — continue navigation normally
  }

  return NextResponse.next()
}
