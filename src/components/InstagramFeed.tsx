'use client'

import { useState, useEffect } from 'react'
import { useSettings } from '@/components/SettingsProvider'
import Image from 'next/image'

interface InstagramFeedProps {
  count?: number
}

export default function InstagramFeed({ count = 6 }: InstagramFeedProps) {
  const settings = useSettings()
  const instagramUrl = settings.instagram_url
  const [isMounted, setIsMounted] = useState(false)
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    setIsMounted(true)
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        const allImages = (data.products || [])
          .flatMap((p: any) => p.images || [])
          .filter((img: string) => img && img.startsWith('http'))
        // Shuffle and pick `count` images
        const shuffled = allImages.sort(() => Math.random() - 0.5)
        setImages(shuffled.slice(0, count))
      })
      .catch(() => {})
  }, [count])

  if (!isMounted) return null

  const displayImages = images.length > 0
    ? images
    : Array.from({ length: count }, () => '')

  const username = instagramUrl?.split('instagram.com/')[1]?.replace(/\/$/, '') || 'marvvn.co'

  return (
    <section className="py-16 border-t">
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="text-2xl lg:text-3xl font-display font-medium mb-2">Follow Us @{username}</h2>
          <p className="text-sm text-marvvn-gray-500">Tag us to be featured</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {displayImages.map((img, i) => (
            <a
              key={i}
              href={instagramUrl || 'https://instagram.com/marvvn.co'}
              target="_blank"
              rel="noopener noreferrer"
              className="aspect-square bg-marvvn-gray-50 overflow-hidden group relative"
            >
              {img ? (
                <Image
                  src={img}
                  alt={`MARVVN post ${i + 1}`}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-marvvn-gray-100 to-marvvn-gray-200 flex items-center justify-center">
                  <svg className="w-8 h-8 text-marvvn-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </div>
            </a>
          ))}
        </div>

        <div className="text-center mt-6">
          <a
            href={instagramUrl || 'https://instagram.com/marvvn.co'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-marvvn-black hover:text-marvvn-gray-600 underline underline-offset-4 transition-colors"
          >
            Follow on Instagram
          </a>
        </div>
      </div>
    </section>
  )
}
