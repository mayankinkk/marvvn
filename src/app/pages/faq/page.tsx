'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSettings } from '@/components/SettingsProvider'
import { useCurrency } from '@/lib/hooks/useCurrency'

const faqCategories = (symbol: string, threshold: string, fee: string, codLimit: string) => [
  {
    category: 'Orders & Shipping',
    items: [
      { q: 'How long does shipping take?', a: 'Standard shipping takes 3-5 business days within India. Express shipping (available at checkout) delivers within 1-2 business days.' },
      { q: 'How can I track my order?', a: 'Once your order is shipped, you\'ll receive a tracking link via email and SMS. You can also track your order from your account dashboard.' },
      { q: 'What are the shipping charges?', a: `We offer free shipping on orders above ${symbol}${threshold}. For orders below ${symbol}${threshold}, a flat shipping fee of ${symbol}${fee} applies.` },
      { q: 'Do you ship internationally?', a: 'Currently, we only ship within India. We\'re working on expanding to international shipping soon.' },
    ]
  },
  {
    category: 'Returns & Exchanges',
    items: [
      { q: 'What is your return policy?', a: 'We offer a 7-day easy return policy. Items must be unworn, unwashed, and in original packaging with tags attached.' },
      { q: 'How do I initiate a return?', a: 'You can initiate a return from your account dashboard under "Orders" or contact our support team.' },
      { q: 'When will I receive my refund?', a: 'Refunds are processed within 5-7 business days after we receive the returned item. The amount will be credited to your original payment method.' },
      { q: 'Can I exchange an item?', a: 'Yes! You can exchange for a different size or color within 7 days of delivery, subject to availability.' },
    ]
  },
  {
    category: 'Products & Sizing',
    items: [
      { q: 'How do I find my size?', a: 'Check our size guide on each product page. Our oversized tees run large — if you\'re between sizes, we recommend sizing down for a regular fit.' },
      { q: 'Are your products genuine?', a: 'Absolutely! 100% of our products are genuine and designed in-house. We use premium fabrics and quality construction.' },
      { q: 'How do I care for my MARVVN clothes?', a: 'Machine wash cold with similar colors. Tumble dry low. Do not bleach or iron on print. Turn inside out before washing to preserve the design.' },
    ]
  },
  {
    category: 'Payment & Promos',
    items: [
      { q: 'What payment methods do you accept?', a: `We accept UPI, credit/debit cards, net banking, and Cash on Delivery (COD) for orders up to ${symbol}${codLimit}.` },
      { q: 'How do I use a promo code?', a: 'Enter your promo code at checkout or in the cart drawer. Click "Apply" and the discount will be reflected in your total.' },
      { q: 'Can I use multiple promo codes?', a: 'Only one promo code can be applied per order. Choose the one that gives you the best discount!' },
    ]
  },
]

export default function FAQPage() {
  const settings = useSettings()
  const { symbol } = useCurrency()
  const [openIndex, setOpenIndex] = useState<string | null>(null)
  const storeEmail = settings.store_email || 'marvvnclothing@gmail.com'
  const faqs = faqCategories(symbol, settings.free_shipping_threshold || '999', settings.shipping_fee || '99', '10,000')

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8 lg:py-12">
        <nav className="flex items-center gap-2 text-xs text-marvvn-gray-500 mb-6">
          <Link href="/" className="hover:text-marvvn-black">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-marvvn-black">FAQ</span>
        </nav>

        <h1 className="text-2xl lg:text-3xl font-display font-medium mb-8">Frequently Asked Questions</h1>

        <div className="max-w-3xl space-y-8">
          {faqs.map((cat) => (
            <div key={cat.category}>
              <h2 className="text-lg font-medium mb-4 pb-2 border-b">{cat.category}</h2>
              <div className="divide-y">
                {cat.items.map((item, i) => {
                  const key = `${cat.category}-${i}`
                  const isOpen = openIndex === key
                  return (
                    <div key={key}>
                      <button
                        type="button"
                        onClick={() => setOpenIndex(isOpen ? null : key)}
                        className="flex items-center justify-between w-full py-4 text-left"
                      >
                        <span className="text-sm font-medium pr-4">{item.q}</span>
                        <ChevronDown className={cn('w-4 h-4 flex-shrink-0 transition-transform', isOpen && 'rotate-180')} />
                      </button>
                      {isOpen && (
                        <p className="pb-4 text-sm text-marvvn-gray-600 leading-relaxed">{item.a}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mt-12 border p-6 text-center">
          <p className="text-sm text-marvvn-gray-600 mb-4">
            Still have questions? We&apos;re here to help!
          </p>
          <Link href="/pages/get-in-touch" className="btn-primary">
            Contact Us
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
