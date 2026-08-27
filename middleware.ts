import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: ['/((?!_next/static|_next/image|api/settings|api/auth|api/admin|favicon.ico|robots.txt|sitemap.xml|placeholder.png).*)'],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip admin routes and API routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Check maintenance mode from cookie (set by SupabaseProvider on first load)
  const maintenanceCookie = request.cookies.get('store_maintenance')

  if (maintenanceCookie?.value === 'true') {
    // Check if user is admin by looking for a session cookie
    const hasSession = request.cookies.get('sb-vowubjguzgdbaircgdwq-auth-token')
    if (!hasSession) {
      // Show maintenance page
      const url = request.nextUrl.clone()
      url.pathname = '/maintenance'
      return NextResponse.rewrite(url)
    }
  }

  return NextResponse.next()
}
