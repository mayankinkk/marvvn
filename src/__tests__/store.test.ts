import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from '@/lib/store'
import { Product } from '@/lib/types'

const mockProduct: Product = {
  id: '1',
  handle: 'test-product',
  title: 'Test Product',
  description: 'A test product',
  price: 999,
  compareAtPrice: 1499,
  images: ['/test.jpg'],
  category: 'men',
  collection: ['new-arrivals'],
  tags: ['test'],
  sizes: ['S', 'M', 'L'],
  colors: ['Black', 'White'],
}

const mockProduct2: Product = {
  ...mockProduct,
  id: '2',
  handle: 'test-product-2',
  title: 'Test Product 2',
}

describe('Cart Store', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], promoCode: '', discount: 0, isOpen: false })
  })

  it('adds item to cart', () => {
    const { addItem } = useCartStore.getState()
    addItem(mockProduct, 'M', 'Black')

    const { items } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].product.id).toBe('1')
    expect(items[0].size).toBe('M')
    expect(items[0].color).toBe('Black')
    expect(items[0].quantity).toBe(1)
  })

  it('increments quantity for same item', () => {
    const { addItem } = useCartStore.getState()
    addItem(mockProduct, 'M', 'Black')
    addItem(mockProduct, 'M', 'Black')

    const { items } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(2)
  })

  it('keeps different sizes as separate items', () => {
    const { addItem } = useCartStore.getState()
    addItem(mockProduct, 'S', 'Black')
    addItem(mockProduct, 'M', 'Black')

    const { items } = useCartStore.getState()
    expect(items).toHaveLength(2)
  })

  it('keeps different colors as separate items', () => {
    const { addItem } = useCartStore.getState()
    addItem(mockProduct, 'M', 'Black')
    addItem(mockProduct, 'M', 'White')

    const { items } = useCartStore.getState()
    expect(items).toHaveLength(2)
  })

  it('removes item from cart', () => {
    const { addItem, removeItem } = useCartStore.getState()
    addItem(mockProduct, 'M', 'Black')
    removeItem('1', 'M', 'Black')

    const { items } = useCartStore.getState()
    expect(items).toHaveLength(0)
  })

  it('updates quantity', () => {
    const { addItem, updateQuantity } = useCartStore.getState()
    addItem(mockProduct, 'M', 'Black')
    updateQuantity('1', 'M', 'Black', 5)

    const { items } = useCartStore.getState()
    expect(items[0].quantity).toBe(5)
  })

  it('removes item when quantity is 0', () => {
    const { addItem, updateQuantity } = useCartStore.getState()
    addItem(mockProduct, 'M', 'Black')
    updateQuantity('1', 'M', 'Black', 0)

    const { items } = useCartStore.getState()
    expect(items).toHaveLength(0)
  })

  it('clamps quantity to 99', () => {
    const { addItem, updateQuantity } = useCartStore.getState()
    addItem(mockProduct, 'M', 'Black')
    updateQuantity('1', 'M', 'Black', 200)

    const { items } = useCartStore.getState()
    expect(items[0].quantity).toBe(99)
  })

  it('calculates total items', () => {
    const { addItem } = useCartStore.getState()
    addItem(mockProduct, 'M', 'Black')
    addItem(mockProduct2, 'L', 'White')

    const { totalItems } = useCartStore.getState()
    expect(totalItems()).toBe(2)
  })

  it('calculates total price', () => {
    const { addItem } = useCartStore.getState()
    addItem(mockProduct, 'M', 'Black')
    addItem(mockProduct2, 'L', 'White')

    const { totalPrice } = useCartStore.getState()
    expect(totalPrice()).toBe(1998)
  })

  it('calculates final price with discount', () => {
    const { addItem } = useCartStore.getState()
    addItem(mockProduct, 'M', 'Black')

    useCartStore.setState({ discount: 10 })

    const { finalPrice } = useCartStore.getState()
    expect(finalPrice()).toBe(899)
  })

  it('clears cart', () => {
    const { addItem, clearCart } = useCartStore.getState()
    addItem(mockProduct, 'M', 'Black')
    clearCart()

    const { items, promoCode, discount } = useCartStore.getState()
    expect(items).toHaveLength(0)
    expect(promoCode).toBe('')
    expect(discount).toBe(0)
  })

  it('toggles cart open state', () => {
    const { toggleCart } = useCartStore.getState()
    expect(useCartStore.getState().isOpen).toBe(false)

    toggleCart()
    expect(useCartStore.getState().isOpen).toBe(true)

    toggleCart()
    expect(useCartStore.getState().isOpen).toBe(false)
  })

  it('sets cart open directly', () => {
    const { setCartOpen } = useCartStore.getState()
    setCartOpen(true)
    expect(useCartStore.getState().isOpen).toBe(true)
  })
})
