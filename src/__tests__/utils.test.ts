import { describe, it, expect } from 'vitest'
import { formatPrice, calculateDiscount, cn } from '@/lib/utils'

describe('formatPrice', () => {
  it('formats INR price without decimals', () => {
    expect(formatPrice(999)).toBe('₹999')
  })

  it('formats large prices with commas', () => {
    expect(formatPrice(12999)).toBe('₹12,999')
  })

  it('formats zero price', () => {
    expect(formatPrice(0)).toBe('₹0')
  })

  it('formats with custom symbol', () => {
    expect(formatPrice(500, 'USD', '$')).toBe('$500')
  })
})

describe('calculateDiscount', () => {
  it('calculates 50% discount', () => {
    expect(calculateDiscount(1000, 500)).toBe(50)
  })

  it('calculates 20% discount', () => {
    expect(calculateDiscount(500, 400)).toBe(20)
  })

  it('returns 0 when no discount', () => {
    expect(calculateDiscount(500, 500)).toBe(0)
  })

  it('rounds to nearest integer', () => {
    expect(calculateDiscount(1000, 333)).toBe(67)
  })
})

describe('cn', () => {
  it('merges class names', () => {
    const result = cn('text-red-500', 'text-blue-500')
    expect(result).toBe('text-blue-500')
  })

  it('handles conditional classes', () => {
    const result = cn('base', false && 'hidden', 'extra')
    expect(result).toContain('base')
    expect(result).toContain('extra')
    expect(result).not.toContain('hidden')
  })
})
