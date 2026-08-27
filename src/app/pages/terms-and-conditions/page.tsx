'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ChevronRight } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8 lg:py-12">
        <nav className="flex items-center gap-2 text-xs text-bonkers-gray-500 mb-6">
          <Link href="/" className="hover:text-bonkers-black">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-bonkers-black">Terms & Conditions</span>
        </nav>

        <div className="max-w-3xl">
          <h1 className="text-2xl lg:text-3xl font-display font-medium mb-8">Terms & Conditions</h1>

          <div className="space-y-6 text-sm text-bonkers-gray-600 leading-relaxed">
            <p><strong>Last updated:</strong> August 2026</p>

            <section>
              <h2 className="text-lg font-medium text-bonkers-black mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing and using the Bonkers Corner website (bonkerscorner.com), you agree to 
                be bound by these Terms & Conditions. If you do not agree, please do not use our website.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-bonkers-black mb-3">2. Products & Pricing</h2>
              <p>
                All product descriptions, images, and specifications are as accurate as possible. 
                Colors may vary slightly due to monitor differences. Prices are in Indian Rupees (INR) 
                and are inclusive of GST unless stated otherwise. We reserve the right to modify prices 
                without prior notice.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-bonkers-black mb-3">3. Orders & Payment</h2>
              <p>
                Placing an order constitutes an offer to purchase. We reserve the right to cancel 
                orders due to stock availability, pricing errors, or suspected fraud. Payment must 
                be completed before order processing (except COD orders).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-bonkers-black mb-3">4. Shipping</h2>
              <p>
                We aim to ship orders within 24-48 hours. Delivery times are estimates and not 
                guaranteed. Free shipping is available on orders above ₹1,499. Shipping charges 
                apply for orders below this threshold.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-bonkers-black mb-3">5. Returns & Refunds</h2>
              <p>
                Returns are accepted within 7 days of delivery per our Return & Exchange Policy. 
                Refunds are processed to the original payment method within 5-7 business days 
                of receiving the returned item.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-bonkers-black mb-3">6. Intellectual Property</h2>
              <p>
                All content on this website, including designs, images, logos, and text, is the 
                property of Bonkers Corner and is protected by copyright laws. Unauthorized 
                reproduction or distribution is prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-bonkers-black mb-3">7. Limitation of Liability</h2>
              <p>
                Bonkers Corner shall not be liable for any indirect, incidental, or consequential 
                damages arising from the use of our products or website. Our total liability shall 
                not exceed the purchase price of the product.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-bonkers-black mb-3">8. Governing Law</h2>
              <p>
                These terms are governed by the laws of India. Any disputes shall be subject to 
                the exclusive jurisdiction of courts in Mumbai, Maharashtra.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-bonkers-black mb-3">9. Contact</h2>
              <p>
                For questions about these terms, contact us at support@bonkerscorner.com or 
                call (+91) 8655700724.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
