'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ChevronRight } from 'lucide-react'

export default function ReturnExchangePolicyPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8 lg:py-12">
        <nav className="flex items-center gap-2 text-xs text-bonkers-gray-500 mb-6">
          <Link href="/" className="hover:text-bonkers-black">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-bonkers-black">Return & Exchange Policy</span>
        </nav>

        <div className="max-w-3xl">
          <h1 className="text-2xl lg:text-3xl font-display font-medium mb-8">Return & Exchange Policy</h1>

          <div className="space-y-6 text-sm text-bonkers-gray-600 leading-relaxed">
            <section>
              <h2 className="text-lg font-medium text-bonkers-black mb-3">7-Day Easy Returns</h2>
              <p>
                We want you to love your Bonkers Corner purchase. If you&apos;re not completely satisfied, 
                you can return or exchange your item within 7 days of delivery.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-bonkers-black mb-3">Eligibility</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Items must be unworn, unwashed, and in original condition</li>
                <li>All tags must be attached</li>
                <li>Items must be in original packaging</li>
                <li>Sale items are eligible for exchange only</li>
                <li>Accessories and caps are non-returnable</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-medium text-bonkers-black mb-3">How to Initiate a Return</h2>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Log in to your account and go to &quot;Orders&quot;</li>
                <li>Select the order containing the item you want to return</li>
                <li>Click &quot;Return Item&quot; and select your reason</li>
                <li>Pack the item securely in its original packaging</li>
                <li>We&apos;ll arrange a pickup from your address</li>
              </ol>
            </section>

            <section>
              <h2 className="text-lg font-medium text-bonkers-black mb-3">Refund Process</h2>
              <p>
                Once we receive and inspect the returned item, your refund will be processed within 
                5-7 business days. The refund will be credited to your original payment method.
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Credit/Debit Card: 5-7 business days</li>
                <li>UPI: 3-5 business days</li>
                <li>Net Banking: 5-7 business days</li>
                <li>Store Credit: Instant</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-medium text-bonkers-black mb-3">Exchanges</h2>
              <p>
                Want a different size or color? We&apos;re happy to exchange your item. Exchanges are 
                subject to availability. If the desired variant is out of stock, we&apos;ll process 
                a refund instead.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-bonkers-black mb-3">Damaged or Defective Items</h2>
              <p>
                If you received a damaged or defective item, please contact us within 48 hours of 
                delivery at support@bonkerscorner.com with photos of the damage. We&apos;ll arrange 
                an immediate replacement or refund.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
