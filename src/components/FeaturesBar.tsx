import { Truck, Flag, Gem } from 'lucide-react'

const features = [
  {
    icon: Truck,
    title: 'SHIPPING WITHIN 48 HOURS',
    description: 'Your order will be shipped within 48 hours from the time since order is placed!',
  },
  {
    icon: Flag,
    title: 'MADE IN INDIA',
    description: 'Our products are 100% made in India. From raw fabric to the final product!',
  },
  {
    icon: Gem,
    title: 'LUXURY FASHION MADE ACCESSIBLE',
    description: 'High-quality clothing at affordable prices',
  },
]

export default function FeaturesBar() {
  return (
    <section className="border-y border-black/8 bg-white">
      <div className="container py-10 lg:py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-black/8">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col items-center text-center px-6 py-6 md:py-0">
              <feature.icon className="w-7 h-7 mb-3 text-black" strokeWidth={1.5} />
              <h3 className="text-xs font-bold uppercase tracking-widest mb-1.5">{feature.title}</h3>
              <p className="text-xs text-marvvn-gray-500 max-w-[200px] leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}