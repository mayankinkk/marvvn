'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
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
    <section className="py-8 lg:py-12">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
          {categories.map((category) => (
            <Link
              key={category.title}
              href={category.link}
              className="group relative overflow-hidden bg-marvvn-gray-100 aspect-[4/3]"
            >
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full bg-marvvn-gray-200 flex items-center justify-center">
                  <span className="text-marvvn-gray-400 text-lg font-display">{category.title}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-lg md:text-xl font-display font-bold text-white mb-2">{category.title}</h3>
                <span className="inline-flex items-center gap-1 text-white text-sm uppercase tracking-wider border-b border-white pb-0.5 group-hover:text-marvvn-gray-200 transition-colors">
                  Explore <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
