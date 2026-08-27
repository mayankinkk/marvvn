'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const slides = [
  {
    desktopImage: 'https://www.bonkerscorner.com/cdn/shop/files/main_banner_1_dae22d89-2b75-4bcd-93e2-2096fefe9c31_1920x700.jpg?v=1782816084',
    mobileImage: 'https://www.bonkerscorner.com/cdn/shop/files/mobile_main_afe71bda-2c7c-4065-8d29-9043c0f43d14_750x1334.jpg?v=1782816176',
    tagline: 'MADE TO MOVE WITH YOU',
    title: 'FREESTYLE COLLECTION',
    ctaText: 'Shop Now',
    ctaLink: '/collections/new-arrivals',
  },
  {
    desktopImage: 'https://www.bonkerscorner.com/cdn/shop/files/spidey_black_wo_3_1920x700.jpg?v=1786083071',
    mobileImage: 'https://www.bonkerscorner.com/cdn/shop/files/spidey_wo_mobile_750x1334.jpg?v=1786081629',
    tagline: 'INSPIRED BY YOUR FRIENDLY NEIGHBORHOOD SPIDER-MAN',
    title: 'SPIDER-MAN COLLECTION',
    ctaText: 'Shop Women',
    ctaLink: '/collections/spiderman-women',
  },
  {
    desktopImage: 'https://www.bonkerscorner.com/cdn/shop/files/reb_bull_website_1_1920x700.jpg?v=1784620202',
    mobileImage: 'https://www.bonkerscorner.com/cdn/shop/files/reb_bull_mobile_1a0cee28-664f-421f-b1fd-94f5c9ec4118_750x1334.jpg?v=1784619880',
    tagline: 'MATCHDAY UNIFORM',
    title: 'RED BULL X MARVNN',
    ctaText: 'Shop Now',
    ctaLink: '/collections/red-bull-collection',
  },
]

export default function HeroBanner() {
  const [current, setCurrent] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [isAutoPlaying])

  return (
    <section
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="relative aspect-[16/7] md:aspect-[16/6] lg:aspect-[16/5]">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={cn(
              'absolute inset-0 transition-opacity duration-700',
              index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
            )}
          >
            {/* Desktop Image */}
            <img
              src={slide.desktopImage}
              alt={slide.title}
              className="hidden md:block w-full h-full object-cover"
            />
            {/* Mobile Image */}
            <img
              src={slide.mobileImage}
              alt={slide.title}
              className="md:hidden w-full h-full object-cover"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/20" />
            {/* Content */}
            <div className="absolute inset-0 flex items-center">
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
                    className="inline-flex items-center gap-2 text-white border-b-2 border-white pb-1 hover:text-marvnn-gray-200 hover:border-marvnn-gray-200 transition-colors text-sm md:text-base uppercase tracking-wider font-medium"
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

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrent(index)}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-300',
              index === current ? 'w-6 bg-white' : 'bg-white/50'
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Arrows */}
      <button
        type="button"
        onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-colors hidden md:flex"
        aria-label="Previous slide"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-colors hidden md:flex"
        aria-label="Next slide"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  )
}