import { Truck, Shield, RotateCcw, CreditCard, Lock, Package } from 'lucide-react'
import { useSettings } from '@/components/SettingsProvider'

const defaultBadges = [
  { icon: 'truck', title: 'Free Shipping', subtitle: 'On orders above ₹999' },
  { icon: 'shield', title: 'Secure Payment', subtitle: '100% secure checkout' },
  { icon: 'rotate', title: 'Easy Returns', subtitle: '3-day return policy' },
  { icon: 'credit-card', title: 'Multiple Payment', subtitle: 'UPI, Cards, Wallets, COD' },
  { icon: 'lock', title: 'SSL Encrypted', subtitle: 'Your data is protected' },
  { icon: 'package', title: 'Quality Assured', subtitle: 'Premium streetwear' },
]

const iconMap: Record<string, any> = {
  truck: Truck,
  shield: Shield,
  rotate: RotateCcw,
  'credit-card': CreditCard,
  lock: Lock,
  package: Package,
}

export default function TrustBadges() {
  const settings = useSettings()

  const badges = defaultBadges.map((badge, i) => ({
    ...badge,
    subtitle: i === 0
      ? `On orders above ₹${settings.free_shipping_threshold || '999'}`
      : badge.subtitle,
  }))

  return (
    <section className="border-t border-b bg-[#f9f9f9]">
      <div className="container py-6 lg:py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
          {badges.map((badge) => {
            const Icon = iconMap[badge.icon] || Shield
            return (
              <div key={badge.title} className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-marvvn-black text-white flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider">{badge.title}</p>
                  <p className="text-[10px] text-marvvn-gray-500 mt-0.5">{badge.subtitle}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
