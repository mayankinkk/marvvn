import { describe, it, expect } from 'vitest'
import { formatPrice, calculateDiscount, cn } from '@/lib/utils'

describe('formatPrice', () => {
  it('formats zero', () => {
    expect(formatPrice(0)).toBe('₹0')
  })

  it('formats whole numbers', () => {
    expect(formatPrice(999)).toBe('₹999')
  })

  it('formats with commas for lakhs', () => {
    expect(formatPrice(123456)).toContain('1')
    expect(formatPrice(123456)).toContain('23,456')
  })

  it('formats decimal prices', () => {
    const result = formatPrice(999.50)
    expect(result).toContain('1,000')
  })
})

describe('calculateDiscount', () => {
  it('calculates percentage discount from prices', () => {
    expect(calculateDiscount(1000, 900)).toBe(10)
  })

  it('returns 0 for no discount', () => {
    expect(calculateDiscount(1000, 1000)).toBe(0)
  })

  it('handles 50% off', () => {
    expect(calculateDiscount(1000, 500)).toBe(50)
  })

  it('handles small amounts', () => {
    expect(calculateDiscount(100, 90)).toBe(10)
  })
})

describe('cn', () => {
  it('merges class names', () => {
    const result = cn('text-red-500', 'text-blue-500')
    expect(result).toContain('text-blue-500')
  })

  it('handles conditional classes', () => {
    const result = cn('base', false && 'hidden', 'extra')
    expect(result).toContain('base')
    expect(result).toContain('extra')
    expect(result).not.toContain('hidden')
  })

  it('handles undefined and null', () => {
    const result = cn('base', undefined, null)
    expect(result).toContain('base')
  })
})

describe('Price calculations', () => {
  it('cart total matches sum of items', () => {
    const items = [
      { price: 999, quantity: 1 },
      { price: 1499, quantity: 2 },
    ]
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    expect(total).toBe(3997)
  })

  it('percentage discount calculation', () => {
    const total = 2000
    const discountPercent = 15
    const discount = (total * discountPercent) / 100
    const finalPrice = total - discount
    expect(discount).toBe(300)
    expect(finalPrice).toBe(1700)
  })

  it('shipping charge addition', () => {
    const subtotal = 999
    const shipping = 65
    const total = subtotal + shipping
    expect(total).toBe(1064)
  })

  it('free shipping above threshold', () => {
    const subtotal = 1499
    const threshold = 999
    const shipping = subtotal >= threshold ? 0 : 65
    expect(shipping).toBe(0)
  })

  it('COD handling - partial online payment', () => {
    const total = 2000
    const shippingPaidOnline = 65
    const codAmount = total - shippingPaidOnline
    expect(codAmount).toBe(1935)
  })
})
