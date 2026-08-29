import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: ['/((?!_next/static|_next/image|api|admin|favicon.ico|robots.txt|sitemap.xml|placeholder.png|maintenance).*)'],
}

/** Decode a base64url JWT payload without verifying the signature */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const decoded = atob(payload)
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

/** Read the Supabase access token from cookies (handles chunked SSR format) */
function getSupabaseToken(request: NextRequest): string | null {
  const projectRef = 'vowubjguzgdbaircgdwq'
  const singleKey = `sb-${projectRef}-auth-token`
  const single = request.cookies.get(singleKey)?.value
  if (single) {
    try {
      const parsed = JSON.parse(single)
      return parsed?.access_token ?? null
    } catch {
      return single
    }
  }

  const chunks: string[] = []
  for (let i = 0; i < 10; i++) {
    const chunk = request.cookies.get(`${singleKey}.${i}`)?.value
    if (!chunk) break
    chunks.push(chunk)
  }
  if (chunks.length > 0) {
    try {
      const joined = chunks.join('')
      const parsed = JSON.parse(joined)
      return parsed?.access_token ?? null
    } catch {
      return null
    }
  }

  return null
}

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next()
  }

  // ── Step 1: Check maintenance mode ──────────────────────────────────────
  let maintenanceOn = false

  try {
    const restUrl = `${supabaseUrl}/rest/v1/store_settings?key=eq.maintenance_mode&select=value`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 4000)

    const res = await fetch(restUrl, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'X-Cache-Bust': Date.now().toString(),
      },
      signal: controller.signal,
      cache: 'no-store',
    })
    clearTimeout(timeoutId)

    if (res.ok) {
      const rows = await res.json()
      maintenanceOn = rows?.[0]?.value === 'true'
    }
  } catch {
    // Cannot reach Supabase — don't enforce maintenance
    return NextResponse.next()
  }

  if (!maintenanceOn) {
    return NextResponse.next()
  }

  // ── Step 2: Maintenance is ON — check if request is from an admin ────────
  const accessToken = getSupabaseToken(request)

  if (!accessToken) {
    return NextResponse.rewrite(new URL('/maintenance', request.url))
  }

  const payload = decodeJwtPayload(accessToken)
  const userId = payload?.sub as string | undefined

  if (!userId) {
    return NextResponse.rewrite(new URL('/maintenance', request.url))
  }

  // ── Step 3: Verify admin status via Supabase REST ────────────────────────
  try {
    const profileUrl = `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=is_admin`
    const controller2 = new AbortController()
    const timeoutId2 = setTimeout(() => controller2.abort(), 3000)
    const profileRes = await fetch(profileUrl, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${accessToken}`,
      },
      signal: controller2.signal,
      cache: 'no-store',
    })
    clearTimeout(timeoutId2)

    if (profileRes.ok) {
      const profiles = await profileRes.json()
      if (profiles?.[0]?.is_admin === true) {
        return NextResponse.next()
      }
    }
  } catch {
    // Cannot verify admin — enforce maintenance (fail closed)
  }

  return NextResponse.rewrite(new URL('/maintenance', request.url))
}
