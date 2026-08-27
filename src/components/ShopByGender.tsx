import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const categories = [
  {
    title: 'SHOP MENS',
    image: 'https://www.bonkerscorner.com/cdn/shop/files/shop_mens_dance_1_800x.jpg?v=1782818058',
    link: '/collections/mens-new-arrivals',
  },
  {
    title: 'SHOP WOMENS',
    image: 'https://www.bonkerscorner.com/cdn/shop/files/shop_womens_dance_e225db73-926f-4fcc-a2fc-8e0035415392_800x.jpg?v=1782816084',
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
              className="group relative overflow-hidden bg-marvvn-gray-50 aspect-[4/3]"
            >
              <img
                src={category.image}
                alt={category.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-lg md:text-xl font-display font-bold text-white mb-2">{category.title}</h3>
                <span className="inline-flex items-center gap-1 text-white text-sm uppercase tracking-wider border-b border-white pb-0.5 hover:text-marvvn-gray-200 transition-colors">
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