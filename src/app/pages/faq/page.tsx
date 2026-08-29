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
      { q: 'How long does shipping take?', a: 'Standard shipping takes 3-5 business days within India. Express shipping (available at checkout) delivers within 1-2 business days. Delivery times may vary depending on your location.' },
      { q: 'How can I track my order?', a: 'Once your order is shipped, you\'ll receive a tracking link via email and WhatsApp. You can also track your order from your account dashboard under "Orders".' },
      { q: 'What are the shipping charges?', a: `We offer free shipping on orders above ${symbol}${threshold}. For orders below ${symbol}${threshold}, a flat shipping fee of ${symbol}${fee} applies. Shipping charges are non-refundable.` },
      { q: 'Do you ship internationally?', a: 'Currently, we only ship within India. We\'re working on expanding to international shipping soon.' },
      { q: 'What if my order is delayed?', a: 'If your order hasn\'t arrived within the expected timeframe, please contact us at marvvnclothing@gmail.com with your order ID. We\'ll investigate and get back to you within 24 hours.' },
    ]
  },
  {
    category: 'Returns & Exchanges',
    items: [
      { q: 'What is your return policy?', a: 'We accept returns within 3 days of delivery. The product must be unused, undamaged, and in its original condition with tags attached. Delivery charges are non-refundable. Damaged or used products are not accepted. Refunds are processed after a quality inspection.' },
      { q: 'How do I initiate a return?', a: 'Go to your account dashboard, navigate to "Orders", find the delivered order, and click "Return". Enter your reason and submit. Our team will review your request within 24-48 hours.' },
      { q: 'When will I receive my refund?', a: 'After we receive and inspect the returned item, your refund will be credited to your original payment method within 5-7 business days. You\'ll receive an email confirmation once the refund is processed.' },
      { q: 'Can I exchange an item?', a: 'MARVVN currently does not offer direct exchanges. If you need a different size or color, please return the original item and place a new order for the desired variant.' },
      { q: 'What if I receive a damaged or defective item?', a: 'Contact us within 24 hours of delivery with photos or videos of the damage. We\'ll arrange a replacement or full refund. Do not use the product after noticing the defect.' },
      { q: 'Are return shipping charges refunded?', a: 'No, delivery charges are non-refundable. Return shipping costs may also be deducted from your refund amount depending on the reason for return.' },
    ]
  },
  {
    category: 'Products & Sizing',
    items: [
      { q: 'How do I find my size?', a: 'Check our size guide on each product page. Our oversized tees run large — if you\'re between sizes, we recommend sizing down for a regular fit. You can also check the "Most Ordered Size" indicator on product pages.' },
      { q: 'Are your products genuine?', a: 'Absolutely! 100% of our products are genuine and designed in-house. We use premium fabrics and quality construction.' },
      { q: 'How do I care for my MARVVN clothes?', a: 'Machine wash cold with similar colors. Tumble dry low. Do not bleach or iron on print. Turn inside out before washing to preserve the design.' },
    ]
  },
  {
    category: 'Payment & Promos',
    items: [
      { q: 'What payment methods do you accept?', a: `We accept UPI, credit/debit cards, net banking, and Cash on Delivery (COD) for orders up to ${symbol}${codLimit}. For COD orders, shipping charges must be paid online at checkout — the remaining product amount is paid on delivery.` },
      { q: 'How do I use a promo code?', a: 'Enter your promo code at checkout or in the cart drawer. Click "Apply" and the discount will be reflected in your total. Only one promo code can be used per order.' },
      { q: 'Is COD available for all orders?', a: `Yes, COD is available for orders up to ${symbol}${codLimit}. For COD orders, you\'ll need to pay the shipping charges (${symbol}${fee}) online at checkout first. The remaining product amount is paid in cash when you receive your order. If your order is above ${symbol}${threshold} (free shipping threshold), no advance payment is needed — you pay the full amount in cash on delivery.` },
      { q: 'What if my payment fails?', a: 'If your payment fails, the amount will not be deducted. If money was debited but the order wasn\'t placed, it will be auto-refunded within 5-7 business days. Contact us if it doesn\'t.' },
      { q: 'Why do I need to pay shipping charges separately for COD?', a: `For COD orders, shipping charges (${symbol}${fee}) must be paid online at checkout to confirm your order. This ensures your order is processed and shipped immediately. The remaining product amount is paid in cash when your order is delivered. If your order total is above ${symbol}${threshold}, shipping is free and you pay nothing until delivery.` },
    ]
  },
]

export default function FAQPage() {
  const settings = useSettings()
  const { symbol } = useCurrency()
  const [openIndex, setOpenIndex] = useState<string | null>(null)
  const storeEmail = settings.store_email || 'marvvnclothing@gmail.com'
  const faqs = faqCategories(symbol, settings.free_shipping_threshold || '999', settings.shipping_fee || '65', '10,000')

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
