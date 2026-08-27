import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
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
    default: 'MARVNN | Unisex Luxury Streetwear Clothing Brand',
    template: '%s | MARVNN',
  },
  description: 'Luxury streetwear clothing brand for men and women. Shop oversized t-shirts, joggers, hoodies, and more. Made in India.',
  keywords: ['streetwear', 'oversized t-shirts', 'joggers', 'hoodies', 'marvnn', 'luxury streetwear', 'indian fashion'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'MARVNN',
    title: 'MARVNN | Unisex Luxury Streetwear Clothing Brand',
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
              name: 'MARVNN',
              url: 'https://bonkerscorner.com',
              logo: 'https://bonkerscorner.com/logo.png',
              sameAs: [
                'https://www.instagram.com/bonkers.corner/',
                'https://www.facebook.com/TeamBonkerscorner',
                'https://x.com/BonkersCornerX',
                'https://www.youtube.com/@bonkerscorner',
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
        {children}
      </body>
    </html>
  )
}
