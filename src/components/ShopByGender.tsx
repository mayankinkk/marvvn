'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSettings } from '@/components/SettingsProvider'

export default function ShopByGender() {
  const settings = useSettings()

  const categories = [
    {
      title: 'SHOP MENS',
      image: settings.shop_mens_image || '',
      link: '/collections/mens-new-arrivals',
    },
    {
      title: 'SHOP WOMENS',
      image: settings.shop_womens_image || '',
      link: '/collections/womens-new-arrivals',
    },
  ]

  return (
    <section className="w-full">
      <div className="grid md:grid-cols-2">
        {categories.map((category) => (
          <Link
            key={category.title}
            href={category.link}
            className="group relative overflow-hidden bg-[#1a1a1a] aspect-[3/4] md:aspect-[4/5] block"
          >
            {category.image ? (
              <Image
                src={category.image}
                alt={category.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
              />
            ) : (
              <div className="w-full h-full bg-[#2a2a2a] flex items-center justify-center">
                <span className="text-white/30 text-2xl font-bold tracking-widest">{category.title}</span>
              </div>
            )}
            {/* Very subtle bottom gradient only */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            {/* Bottom-left text — Bonkers Corner style */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 tracking-tight leading-none">
                {category.title}
              </h3>
              <span className="inline-block border border-white text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 group-hover:bg-white group-hover:text-black transition-colors duration-300">
                EXPLORE
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
