import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

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
    // Check maintenance mode from Supabase REST API
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
        // Use @supabase/ssr to properly read chunked auth cookies
        let response = NextResponse.next()

        const supabase = createServerClient(supabaseUrl, supabaseKey, {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value
            },
            set(name: string, value: string, options) {
              response.cookies.set({ name, value, ...options })
            },
            remove(name: string, options) {
              response.cookies.set({ name, value: '', ...options })
            },
          },
        })

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          // Not logged in — show maintenance page
          return NextResponse.rewrite(new URL('/maintenance', request.url))
        }

        // User is logged in — check if they are an admin
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()

        if (!profile?.is_admin) {
          // Logged in but not an admin — show maintenance page
          return NextResponse.rewrite(new URL('/maintenance', request.url))
        }

        // Admin — let them through
        return response
      }
    }
  } catch {
    // Settings fetch failed — continue navigation normally
  }

  return NextResponse.next()
}
