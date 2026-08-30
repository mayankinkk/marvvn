'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSettings } from '@/components/SettingsProvider'

export default function HeroBanner() {
  const settings = useSettings()
  const [current, setCurrent] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const slides = [
    {
      desktopImage: settings.hero_banner_1_image || '/images/banners/hero-1-desktop.svg',
      mobileImage: settings.hero_banner_1_mobile_image || settings.hero_banner_1_image || '/images/banners/hero-1-mobile.svg',
      tagline: settings.hero_banner_1_subtitle || 'MADE TO MOVE WITH YOU',
      title: settings.hero_banner_1_title || 'FREESTYLE COLLECTION',
      ctaText: 'Shop Now',
      ctaLink: settings.hero_banner_1_link || '/collections/new-arrivals',
    },
    {
      desktopImage: settings.hero_banner_2_image || '/images/banners/hero-2-desktop.svg',
      mobileImage: settings.hero_banner_2_mobile_image || settings.hero_banner_2_image || '/images/banners/hero-2-mobile.svg',
      tagline: settings.hero_banner_2_subtitle || 'INSPIRED BY YOUR FRIENDLY NEIGHBORHOOD SPIDER-MAN',
      title: settings.hero_banner_2_title || 'SPIDER-MAN COLLECTION',
      ctaText: 'Shop Women',
      ctaLink: settings.hero_banner_2_link || '/collections/spiderman-women',
    },
    {
      desktopImage: settings.hero_banner_3_image || '/images/banners/hero-3-desktop.svg',
      mobileImage: settings.hero_banner_3_mobile_image || settings.hero_banner_3_image || '/images/banners/hero-3-mobile.svg',
      tagline: settings.hero_banner_3_subtitle || 'MATCHDAY UNIFORM',
      title: settings.hero_banner_3_title || 'RED BULL X MARVVN',
      ctaText: 'Shop Now',
      ctaLink: settings.hero_banner_3_link || '/collections/red-bull-collection',
    },
  ]

  useEffect(() => {
    if (!isAutoPlaying) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [isAutoPlaying, slides.length])


  return (
    <section
      className="relative w-full h-full overflow-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="relative h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={cn(
              'absolute inset-0 transition-opacity duration-700',
              index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
            )}
          >
            <Image
              src={slide.desktopImage}
              alt={slide.title}
              fill
              sizes="100vw"
              className="hidden md:block object-cover"
              priority={index === 0}
            />
            <Image
              src={slide.mobileImage}
              alt={slide.title}
              fill
              sizes="100vw"
              className="md:hidden object-cover"
              priority={index === 0}
            />
            {/* Top gradient blur overlay */}
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/40 via-black/10 to-transparent z-10" />
            <div className="absolute inset-0 flex items-end pb-16 md:items-center md:pb-0">
              <div className="container">
                <div className="max-w-xl">
                  <p className="text-white/80 text-xs md:text-sm uppercase tracking-[0.2em] mb-2 md:mb-3">
                    {slide.tagline}
                  </p>
                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-4 md:mb-6">
                    {slide.title}
                  </h2>
                  <Link
                    href={slide.ctaLink}
                    className="inline-flex items-center gap-2 text-white border-b-2 border-white pb-1 hover:text-marvvn-gray-200 hover:border-marvvn-gray-200 transition-colors text-sm md:text-base uppercase tracking-wider font-medium"
                  >
                    {slide.ctaText}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrent(index)}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-300 cursor-pointer',
              index === current ? 'w-6 bg-white' : 'bg-white/50'
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/80 hover:bg-white rounded-full items-center justify-center transition-colors hidden md:flex cursor-pointer"
        aria-label="Previous slide"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/80 hover:bg-white rounded-full items-center justify-center transition-colors hidden md:flex cursor-pointer"
        aria-label="Next slide"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  )
}
