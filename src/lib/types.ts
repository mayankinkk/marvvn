export interface Product {
  id: string
  handle: string
  title: string
  description: string
  price: number
  compareAtPrice?: number
  images: string[]
  category: 'men' | 'women' | 'accessories'
  collection: string[]
  tags: string[]
  sizes: string[]
  colors: string[]
  isNew?: boolean
  isBestseller?: boolean
  badge?: 'new' | 'sale' | 'bestseller' | null
  stock?: number
  low_stock_threshold?: number
  flash_sale?: boolean
  flash_sale_price?: number
  flash_sale_ends_at?: string
}

export interface Collection {
  id: string
  handle: string
  title: string
  description: string
  image: string
  products: Product[]
  category: 'men' | 'women' | 'accessories' | 'all'
}

export interface BlogPost {
  id: string
  handle: string
  title: string
  excerpt: string
  image: string
  date: string
  author: string
  tags: string[]
}

export interface CartItem {
  product: Product
  quantity: number
  size: string
  color: string
}

export interface MegaMenuColumn {
  title: string
  links: { label: string; href: string }[]
}

export interface MegaMenuSection {
  title: string
  columns: MegaMenuColumn[]
  featuredImage?: {
    src: string
    alt: string
    href: string
    label: string
  }
}