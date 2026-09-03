export interface ProductVariant {
  id: string
  product_id: string
  size: string
  color: string
  stock: number
  sku?: string
  created_at?: string
  updated_at?: string
}

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
  variants?: ProductVariant[]
  available_sizes?: { size: string; stock: number }[]
  availableSizes?: { size: string; stock: number }[]
  flash_sale?: boolean
  flash_sale_price?: number
  flash_sale_ends_at?: string
  fabric_composition?: string
  gsm?: string
  waist?: string
  length?: string
  model_info?: string
  what_you_get?: { icon: string; title: string; subtitle: string }[]
  size_fit_text?: string
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