'use client'

import Link from 'next/link'
import Image from 'next/image'

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
        {/* Bonkers Corner: tall portrait-ish ratio, edge-to-edge */}
        <div className="relative aspect-[16/9] md:aspect-[21/9]">
          <Image
            src={desktopImage}
            alt={title}
            fill
            sizes="100vw"
            className="hidden md:block object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
          />
          <Image
            src={mobileImage}
            alt={title}
            fill
            sizes="100vw"
            className="md:hidden object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
          />
          {/* Gradient: bottom-heavy so text pops */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* Text: bottom-left or bottom-right */}
          <div className={`absolute bottom-0 left-0 right-0 p-8 md:p-12 ${reverse ? 'text-right' : 'text-left'}`}>
            {tagline && (
              <p className="text-white/70 text-xs uppercase tracking-[0.25em] mb-2 font-medium">
                {tagline}
              </p>
            )}
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-5 leading-none tracking-tight">
              {title}
            </h2>
            <span className="inline-block border border-white text-white text-xs font-bold uppercase tracking-widest px-6 py-3 group-hover:bg-white group-hover:text-black transition-colors duration-300">
              {ctaText}
            </span>
          </div>
        </div>
      </Link>
    </section>
  )
}
