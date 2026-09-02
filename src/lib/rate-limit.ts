import { createAdminClient } from '@/lib/supabase/admin'

export async function rateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): Promise<{ success: boolean; remaining: number; resetAt: number }> {
  const now = Date.now()
  const windowStart = new Date(now - windowMs).toISOString()

  try {
    const supabase = createAdminClient()

    const { count } = await supabase
      .from('rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('key', key)
      .gte('created_at', windowStart)

    const currentCount = count || 0

    if (currentCount >= maxRequests) {
      const resetAt = now + windowMs
      return { success: false, remaining: 0, resetAt }
    }

    await supabase.from('rate_limits').insert({ key, created_at: new Date(now).toISOString() })

    const remaining = maxRequests - currentCount - 1
    const resetAt = now + windowMs
    return { success: true, remaining, resetAt }
  } catch {
    return { success: true, remaining: maxRequests - 1, resetAt: now + windowMs }
  }
}
