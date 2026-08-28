import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/account/', '/checkout/', '/api/'],
      },
    ],
    sitemap: 'https://marvvn.online/sitemap.xml',
  }
}
