interface JsonLdProps {
  data: Record<string, any>
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export function ProductJsonLd({
  product,
  reviews = [],
}: {
  product: {
    title: string
    handle: string
    description: string
    price: number
    compareAtPrice?: number
    images: string[]
    category: string
    sizes?: string[]
    stock?: number
  }
  reviews?: { rating: number; count: number }[]
}) {
  const baseUrl = 'https://marvvn.online'
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : undefined
  const reviewCount = reviews.reduce((sum, r) => sum + r.count, 0)

  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    url: `${baseUrl}/products/${product.handle}`,
    image: product.images.map(img => img.startsWith('http') ? img : `${baseUrl}${img}`),
    brand: {
      '@type': 'Brand',
      name: 'MARVVN',
    },
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/products/${product.handle}`,
      priceCurrency: 'INR',
      price: product.price,
      availability: (product.stock && product.stock > 0)
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'MARVVN',
      },
    },
  }

  if (product.compareAtPrice && product.compareAtPrice > product.price) {
    schema.offers.priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }

  if (avgRating !== undefined) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: avgRating.toFixed(1),
      reviewCount,
      bestRating: 5,
      worstRating: 1,
    }
  }

  if (product.category) {
    schema.category = product.category
  }

  return <JsonLd data={schema} />
}

export function CollectionJsonLd({
  collection,
  products,
}: {
  collection: { title: string; handle: string; description?: string }
  products: { title: string; handle: string; price: number; images: string[] }[]
}) {
  const baseUrl = 'https://marvvn.online'

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: collection.title,
    description: collection.description || `Shop ${collection.title} at MARVVN`,
    url: `${baseUrl}/collections/${collection.handle}`,
    numberOfItems: products.length,
    itemListElement: products.map((product, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${baseUrl}/products/${product.handle}`,
      name: product.title,
      image: product.images[0] ? (product.images[0].startsWith('http') ? product.images[0] : `${baseUrl}${product.images[0]}`) : undefined,
    })),
  }

  return <JsonLd data={schema} />
}

export function BlogJsonLd({
  post,
}: {
  post: {
    title: string
    handle: string
    excerpt?: string
    content?: string
    created_at: string
    updated_at?: string
    author?: string
    image?: string
  }
}) {
  const baseUrl = 'https://marvvn.online'

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.title,
    url: `${baseUrl}/blogs/${post.handle}`,
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    author: {
      '@type': 'Organization',
      name: post.author || 'MARVVN',
    },
    publisher: {
      '@type': 'Organization',
      name: 'MARVVN',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    image: post.image ? (post.image.startsWith('http') ? post.image : `${baseUrl}${post.image}`) : undefined,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blogs/${post.handle}`,
    },
  }

  return <JsonLd data={schema} />
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[]
}) {
  const baseUrl = 'https://marvvn.online'

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
    })),
  }

  return <JsonLd data={schema} />
}

export function WebsiteJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'MARVVN',
        url: 'https://marvvn.online',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://marvvn.online/search?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      }}
    />
  )
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'MARVVN',
        url: 'https://marvvn.online',
        logo: 'https://marvvn.online/logo.png',
        sameAs: [
          'https://instagram.com/marvvn',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'marvvnclothing@gmail.com',
          contactType: 'customer service',
          availableLanguage: ['English', 'Hindi'],
        },
      }}
    />
  )
}
