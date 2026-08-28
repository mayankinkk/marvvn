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
    const settingsRes = await fetch(url, { next: { revalidate: 60 } })
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
    // If settings fetch fails, continue normally
  }

  return NextResponse.next()
}
