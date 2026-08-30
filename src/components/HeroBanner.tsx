'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
              'absolute inset-0 transition-opacity duration-1000',
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

            {/* Top gradient: ensures header text (white) is always readable over any banner */}
            <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/60 via-black/20 to-transparent z-10" />
            {/* Bottom gradient: ensures CTA text is readable */}
            <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />

            {/* Text block: bottom-left, stark and bold */}
            <div className="absolute bottom-0 left-0 right-0 z-20 p-8 md:p-12 lg:p-16">
              <p className="text-white/70 text-xs uppercase tracking-[0.25em] mb-2 font-medium">
                {slide.tagline}
              </p>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-5 leading-none tracking-tight">
                {slide.title}
              </h2>
              <Link
                href={slide.ctaLink}
                className="inline-block border border-white text-white text-xs font-bold uppercase tracking-widest px-6 py-3 hover:bg-white hover:text-black transition-colors duration-300"
              >
                {slide.ctaText}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-8 md:bottom-12 lg:bottom-16 right-8 md:right-12 lg:right-16 z-30 flex items-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrent(index)}
            className={cn(
              'transition-all duration-300 cursor-pointer',
              index === current
                ? 'w-8 h-[2px] bg-white'
                : 'w-4 h-[2px] bg-white/40'
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Prev / Next — sharp square, Bonkers style */}
      <button
        type="button"
        onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-4 bottom-1/2 translate-y-1/2 z-30 w-10 h-10 border border-white/60 bg-black/20 backdrop-blur-sm text-white items-center justify-center transition-all hover:bg-white hover:text-black hidden md:flex cursor-pointer"
        aria-label="Previous slide"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
        className="absolute right-4 bottom-1/2 translate-y-1/2 z-30 w-10 h-10 border border-white/60 bg-black/20 backdrop-blur-sm text-white items-center justify-center transition-all hover:bg-white hover:text-black hidden md:flex cursor-pointer"
        aria-label="Next slide"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  )
}
