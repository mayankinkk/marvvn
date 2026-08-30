import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase
const mockSupabase = {
  from: vi.fn(),
  auth: { getUser: vi.fn() },
  rpc: vi.fn(),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => mockSupabase,
}))

describe('Cancel Order API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects missing orderId', async () => {
    const { POST } = await import('@/app/api/cancel-order/route')
    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('rejects missing email', async () => {
    const { POST } = await import('@/app/api/cancel-order/route')
    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ orderId: '123' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('rejects non-existent order', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
          }),
        }),
      }),
    })

    const { POST } = await import('@/app/api/cancel-order/route')
    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ orderId: '123', email: 'test@test.com' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(404)
  })

  it('rejects already cancelled order', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: '123', status: 'cancelled', created_at: new Date().toISOString(), shipping_address: {}, status_history: [] },
              error: null,
            }),
          }),
        }),
      }),
    })

    const { POST } = await import('@/app/api/cancel-order/route')
    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ orderId: '123', email: 'test@test.com' }),
    })
    const res = await POST(req)
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.error).toContain('already cancelled')
  })

  it('rejects shipped order', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: '123', status: 'shipped', created_at: new Date().toISOString(), shipping_address: {}, status_history: [] },
              error: null,
            }),
          }),
        }),
      }),
    })

    const { POST } = await import('@/app/api/cancel-order/route')
    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ orderId: '123', email: 'test@test.com' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('rejects order older than 1 hour', async () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: '123', status: 'pending', created_at: twoHoursAgo, shipping_address: {}, status_history: [] },
              error: null,
            }),
          }),
        }),
      }),
    })

    const { POST } = await import('@/app/api/cancel-order/route')
    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ orderId: '123', email: 'test@test.com' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('allows cancellation within 1 hour', async () => {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
    const mockUpdate = vi.fn().mockResolvedValue({ error: null })
    const mockSelect = vi.fn().mockResolvedValue({ data: [], error: null })

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'orders') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: '123', status: 'pending', created_at: thirtyMinAgo, shipping_address: { phone: '919999999999' }, status_history: [] },
                  error: null,
                }),
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: mockUpdate,
          }),
        }
      }
      if (table === 'order_items') {
        return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue(mockSelect) }) }
      }
      if (table === 'products') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { stock: 10 }, error: null }),
            }),
          }),
          update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
        }
      }
      return { select: vi.fn(), insert: vi.fn() }
    })

    mockSupabase.rpc.mockResolvedValue({ error: null })

    const { POST } = await import('@/app/api/cancel-order/route')
    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ orderId: '123', email: 'test@test.com' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
  })
})
