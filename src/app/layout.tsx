import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import { Inter, Playfair_Display } from 'next/font/google'
import { SupabaseProvider } from '@/components/SupabaseProvider'
import { SettingsProvider } from '@/components/SettingsProvider'
import AuthCodeHandler from '@/components/AuthCodeHandler'
import { I18nProvider } from '@/lib/i18n'
import { AnalyticsScripts, Analytics, Pixel } from '@/components/Analytics'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  title: {
    default: 'MARVVN | Unisex Luxury Streetwear Clothing Brand',
    template: '%s | MARVVN',
  },
  description: 'Luxury streetwear clothing brand for men and women. Shop oversized t-shirts, joggers, hoodies, and more. Made in India.',
  keywords: ['streetwear', 'oversized t-shirts', 'joggers', 'hoodies', 'marvvn', 'luxury streetwear', 'indian fashion'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'MARVVN',
    title: 'MARVVN | Unisex Luxury Streetwear Clothing Brand',
    description: 'Luxury streetwear clothing brand for men and women. Shop oversized t-shirts, joggers, hoodies, and more.',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MARVVN',
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <AnalyticsScripts />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192.png" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <Suspense fallback={null}>
          <Analytics />
          <Pixel />
          <SpeedInsights />
        </Suspense>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'MARVVN',
              url: 'https://marvvn.online',
              logo: 'https://marvvn.online/logo.png',
              sameAs: [],
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '',
                contactType: 'customer service',
                availableLanguage: ['English', 'Hindi'],
              },
            }),
          }}
        />
        <SettingsProvider>
          <SupabaseProvider>
              <Suspense fallback={null}>
                <AuthCodeHandler />
              </Suspense>
              <I18nProvider>
                {children}
              </I18nProvider>
          </SupabaseProvider>
        </SettingsProvider>
      </body>
    </html>
  )
}
