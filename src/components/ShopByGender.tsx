import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const categories = [
  {
    title: 'SHOP MENS',
    image: '/images/shop-mens.jpg',
    link: '/collections/mens-new-arrivals',
  },
  {
    title: 'SHOP WOMENS',
    image: '/images/shop-womens.jpg',
    link: '/collections/womens-new-arrivals',
  },
]

export default function ShopByGender() {
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
              <div className="w-full h-full bg-marvvn-gray-200 flex items-center justify-center">
                <span className="text-marvvn-gray-400 text-lg font-display">{category.title}</span>
              </div>
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
