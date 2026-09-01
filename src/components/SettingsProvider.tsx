'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface StoreSettings {
  [key: string]: string
}

const SettingsContext = createContext<StoreSettings>({})

const DEFAULTS: Record<string, string> = {
  store_name: 'MARVVN',
  store_description: 'Premium streetwear and oversized tees',
  store_email: 'marvvnclothing@gmail.com',
  store_phone: '7578017237',
  store_address: 'Faridabad',
  currency: 'INR',
  currency_symbol: '₹',
  tax_rate: '0',
  free_shipping_threshold: '999',
  shipping_fee: '65',
  whatsapp_number: '917578017237',
  instagram_url: '',
  facebook_url: '',
  twitter_url: '',
  youtube_url: '',
  instagram_dm_url: '',
  facebook_dm_url: '',
  tawk_to_id: '',
  whatsapp_catalog_url: '',
  logo_url: '',
  primary_color: '#000000',
  accent_color: '#666666',
  announcement_bar: '⚡︎NOT MADE TO FIT IN | BUILT FOR THE REAL ONES ⚡︎',
  promo_code: 'MARVVN10',
  promo_discount: '10%',
  promo_min_cart: '999',
  maintenance_mode: 'false',
  maintenance_message: 'We are currently under maintenance. Please check back later.',
  seo_title: 'MARVVN | Unisex Luxury Streetwear Clothing Brand',
  seo_description: 'Luxury streetwear clothing brand for men and women. Shop oversized t-shirts, joggers, hoodies, and more.',
  seo_keywords: 'streetwear, oversized t-shirts, joggers, hoodies, marvvn',
  mega_menu: '[]',
  popular_searches: '[]',
  footer_shop_links: JSON.stringify([
    { label: 'Best Sellers', href: '/collections/best-sellers' },
    { label: 'Special Prices', href: '/collections/special-prices' },
    { label: 'New Arrivals', href: '/collections/new-arrivals' },
    { label: 'Signature', href: '/collections/signature-collection-app' },
  ]),
  footer_trending_links: JSON.stringify([
    { label: 'ACOSTA Collection', href: '/collections/acosta-collection-app' },
    { label: 'Anime Collection', href: '/collections/anime-collection-app' },
    { label: 'Oversized T-shirt', href: '/collections/oversized-t-shirt-men' },
    { label: 'Bottoms for Women', href: '/collections/womens-bottoms' },
    { label: 'Bottoms for Men', href: '/collections/mens-bottoms' },
    { label: 'Sweatshirts & Hoodies', href: '/collections/sweatshirts-hoodies' },
  ]),
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULTS)

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => setSettings({ ...DEFAULTS, ...data }))
      .catch(() => {})
  }, [])

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  return useContext(SettingsContext)
}
