import { Truck, CreditCard, Flag, Gem } from 'lucide-react'

const features = [
  {
    icon: Truck,
    title: 'SHIPPING WITHIN 48 HOURS',
    description: 'Your order will be shipped within 48 hours from the time since order is placed!',
  },
  {
    icon: CreditCard,
    title: '5% OFF',
    description: '5% OFF on Pre-paid orders.',
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
    <section className="border-y border-marvnn-gray-100 bg-marvnn-gray-50">
      <div className="container py-8 lg:py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="text-center">
              <feature.icon className="w-8 h-8 mx-auto mb-3 text-marvnn-black" strokeWidth={1.5} />
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-1">{feature.title}</h3>
              <p className="text-xs text-marvnn-gray-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}