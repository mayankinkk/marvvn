'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    fbq: (...args: any[]) => void
    _fbq: any
  }
}

export function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!GA_ID) return
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
    window.gtag('config', GA_ID, { page_path: url })
  }, [pathname, searchParams])

  return null
}

export function Pixel() {
  const pathname = usePathname()

  useEffect(() => {
    if (!META_PIXEL_ID) return
    window.fbq('track', 'PageView')
  }, [pathname])

  return null
}

export function AnalyticsScripts() {
  return (
    <>
      {GA_ID && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${GA_ID}');`,
            }}
          />
        </>
      )}
      {META_PIXEL_ID && (
        <>
          <script
            dangerouslySetInnerHTML={{
              __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init', '${META_PIXEL_ID}');fbq('track', 'PageView');`,
            }}
          />
          <noscript>
            <img height="1" width="1" style={{ display: 'none' }} src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`} />
          </noscript>
        </>
      )}
    </>
  )
}

export function trackAddToCart(productId: string, productName: string, price: number) {
  if (typeof window === 'undefined') return
  if (window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'INR',
      value: price,
      items: [{ item_id: productId, item_name: productName, price }],
    })
  }
  if (window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_ids: [productId],
      content_name: productName,
      value: price,
      currency: 'INR',
    })
  }
}

export function trackPurchase(orderId: string, total: number, items: { id: string; name: string; price: number; quantity: number }[]) {
  if (typeof window === 'undefined') return
  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: orderId,
      value: total,
      currency: 'INR',
      items: items.map(i => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.quantity })),
    })
  }
  if (window.fbq) {
    window.fbq('track', 'Purchase', {
      content_ids: items.map(i => i.id),
      value: total,
      currency: 'INR',
      num_items: items.reduce((sum, i) => sum + i.quantity, 0),
    })
  }
}

export function trackSearch(searchTerm: string) {
  if (typeof window === 'undefined') return
  if (window.gtag) {
    window.gtag('event', 'search', { search_term: searchTerm })
  }
}

export function trackViewItem(productId: string, productName: string, price: number) {
  if (typeof window === 'undefined') return
  if (window.gtag) {
    window.gtag('event', 'view_item', {
      currency: 'INR',
      value: price,
      items: [{ item_id: productId, item_name: productName, price }],
    })
  }
  if (window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_ids: [productId],
      content_name: productName,
      value: price,
      currency: 'INR',
    })
  }
}

export function trackViewItemList(items: { id: string; name: string; price: number; position: number }[], listName: string) {
  if (typeof window === 'undefined') return
  if (window.gtag) {
    window.gtag('event', 'view_item_list', {
      items: items.map(i => ({
        item_id: i.id,
        item_name: i.name,
        price: i.price,
        index: i.position,
      })),
    })
  }
  if (window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_ids: items.map(i => i.id),
      content_type: 'product',
      content_name: listName,
    })
  }
}

export function trackSelectItem(productId: string, productName: string, price: number, listName: string, position: number) {
  if (typeof window === 'undefined') return
  if (window.gtag) {
    window.gtag('event', 'select_item', {
      items: [{ item_id: productId, item_name: productName, price, index: position }],
    })
  }
  if (window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_ids: [productId],
      content_name: productName,
      content_type: 'product',
    })
  }
}

export function trackBeginCheckout(total: number, items: { id: string; name: string; price: number; quantity: number }[]) {
  if (typeof window === 'undefined') return
  if (window.gtag) {
    window.gtag('event', 'begin_checkout', {
      currency: 'INR',
      value: total,
      items: items.map(i => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.quantity })),
    })
  }
  if (window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      content_ids: items.map(i => i.id),
      value: total,
      currency: 'INR',
      num_items: items.reduce((sum, i) => sum + i.quantity, 0),
    })
  }
}

export function trackRemoveFromCart(productId: string, productName: string, price: number, quantity: number) {
  if (typeof window === 'undefined') return
  if (window.gtag) {
    window.gtag('event', 'remove_from_cart', {
      currency: 'INR',
      value: price * quantity,
      items: [{ item_id: productId, item_name: productName, price, quantity }],
    })
  }
  if (window.fbq) {
    window.fbq('track', 'RemoveFromCart', {
      content_ids: [productId],
      content_name: productName,
      value: price * quantity,
      currency: 'INR',
    })
  }
}

export function trackRefund(orderId: string, total: number) {
  if (typeof window === 'undefined') return
  if (window.gtag) {
    window.gtag('event', 'refund', {
      transaction_id: orderId,
      value: total,
      currency: 'INR',
    })
  }
}

export function trackShare(contentType: string, id: string, method: string) {
  if (typeof window === 'undefined') return
  if (window.gtag) {
    window.gtag('event', 'share', { content_type: contentType, content_id: id, method })
  }
}
