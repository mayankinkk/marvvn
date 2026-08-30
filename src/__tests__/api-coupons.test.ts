import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSupabase = {
  from: vi.fn(),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => mockSupabase,
}))

describe('Coupon Validation API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects missing code', async () => {
    const { POST } = await import('@/app/api/coupons/validate/route')
    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns invalid for non-existent coupon', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
          }),
        }),
      }),
    })

    const { POST } = await import('@/app/api/coupons/validate/route')
    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ code: 'FAKECODE' }),
    })
    const res = await POST(req)
    const body = await res.json()
    expect(body.valid).toBe(false)
  })

  it('returns valid for active coupon', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                code: 'WELCOME10',
                discount_type: 'percentage',
                discount_value: 10,
                min_cart: 0,
                max_uses: null,
                used_count: 0,
                active: true,
                expires_at: null,
              },
              error: null,
            }),
          }),
        }),
      }),
    })

    const { POST } = await import('@/app/api/coupons/validate/route')
    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ code: 'welcome10' }),
    })
    const res = await POST(req)
    const body = await res.json()
    expect(body.valid).toBe(true)
    expect(body.code).toBe('WELCOME10')
    expect(body.discount_value).toBe(10)
  })

  it('rejects expired coupon', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                code: 'EXPIRED',
                discount_type: 'percentage',
                discount_value: 10,
                min_cart: 0,
                max_uses: null,
                used_count: 0,
                active: true,
                expires_at: '2020-01-01T00:00:00Z',
              },
              error: null,
            }),
          }),
        }),
      }),
    })

    const { POST } = await import('@/app/api/coupons/validate/route')
    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ code: 'EXPIRED' }),
    })
    const res = await POST(req)
    const body = await res.json()
    expect(body.valid).toBe(false)
    expect(body.reason).toBe('expired')
  })

  it('rejects coupon that reached usage limit', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                code: 'LIMITED',
                discount_type: 'percentage',
                discount_value: 10,
                min_cart: 0,
                max_uses: 5,
                used_count: 5,
                active: true,
                expires_at: null,
              },
              error: null,
            }),
          }),
        }),
      }),
    })

    const { POST } = await import('@/app/api/coupons/validate/route')
    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ code: 'LIMITED' }),
    })
    const res = await POST(req)
    const body = await res.json()
    expect(body.valid).toBe(false)
    expect(body.reason).toBe('limit_reached')
  })
})
