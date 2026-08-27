'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface PromoBannerProps {
  desktopImage: string
  mobileImage: string
  tagline?: string
  title: string
  ctaText: string
  ctaLink: string
  reverse?: boolean
}

export default function PromoBanner({ desktopImage, mobileImage, tagline, title, ctaText, ctaLink, reverse }: PromoBannerProps) {
  return (
    <section className="relative w-full overflow-hidden group">
      <Link href={ctaLink}>
        <div className="relative aspect-[16/7] md:aspect-[16/6] lg:aspect-[16/5]">
          <img
            src={desktopImage}
            alt={title}
            className="hidden md:block w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <img
            src={mobileImage}
            alt={title}
            className="md:hidden w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-black/20" />
          <div className={`absolute inset-0 flex items-center ${reverse ? 'justify-end' : 'justify-start'}`}>
            <div className="container">
              <div className={`max-w-xl ${reverse ? 'text-right ml-auto' : ''}`}>
                {tagline && (
                  <p className="text-white/80 text-xs md:text-sm uppercase tracking-[0.2em] mb-2">
                    {tagline}
                  </p>
                )}
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-4 md:mb-6">
                  {title}
                </h2>
                <span className="inline-flex items-center gap-2 text-white border-b-2 border-white pb-1 hover:text-bonkers-gray-200 hover:border-bonkers-gray-200 transition-colors text-sm md:text-base uppercase tracking-wider font-medium">
                  {ctaText}
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </section>
  )
}