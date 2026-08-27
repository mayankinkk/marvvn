'use client'

import ProductForm from '@/components/ProductForm'

export default function EditProductPage({ params }: { params: { id: string } }) {
  return <ProductForm productId={params.id} />
}
