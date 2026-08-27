import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { SupabaseProvider } from '@/components/SupabaseProvider'
import { SettingsProvider } from '@/components/SettingsProvider'
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
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'MARVVN',
              url: 'https://marvvn.online',
              logo: 'https://marvvn.online/logo.png',
              sameAs: [
                'https://www.instagram.com/bonkers.corner/',
                'https://www.facebook.com/TeamBonkerscorner',
                'https://x.com/BonkersCornerX',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+91-8655700724',
                contactType: 'customer service',
                availableLanguage: 'English',
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <SettingsProvider>
          <SupabaseProvider>
            {children}
          </SupabaseProvider>
        </SettingsProvider>
      </body>
    </html>
  )
}
