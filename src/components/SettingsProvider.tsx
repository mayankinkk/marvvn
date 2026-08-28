'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface StoreSettings {
  [key: string]: string
}

const SettingsContext = createContext<StoreSettings>({})

const DEFAULTS: Record<string, string> = {
  store_name: 'MARVVN',
  store_description: 'Premium streetwear and oversized tees',
  store_email: 'support@marvvn.online',
  store_phone: '',
  store_address: 'India',
  currency: 'INR',
  currency_symbol: '₹',
  tax_rate: '0',
  free_shipping_threshold: '999',
  shipping_fee: '99',
  whatsapp_number: '917578017237',
  instagram_url: '',
  facebook_url: '',
  twitter_url: '',
  youtube_url: '',
  logo_url: '',
  primary_color: '#000000',
  accent_color: '#666666',
  announcement_bar: '⚡︎NOT MADE TO FIT IN | BUILT FOR THE REAL ONES ⚡︎',
  maintenance_mode: 'false',
  maintenance_message: 'We are currently under maintenance. Please check back later.',
  seo_title: 'MARVVN | Unisex Luxury Streetwear Clothing Brand',
  seo_description: 'Luxury streetwear clothing brand for men and women. Shop oversized t-shirts, joggers, hoodies, and more.',
  seo_keywords: 'streetwear, oversized t-shirts, joggers, hoodies, marvvn',
  mega_menu: '[]',
  popular_searches: '[]',
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
