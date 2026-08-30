import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ChevronRight } from 'lucide-react'

export const metadata = {
  title: 'Return & Exchange Policy | MARVVN',
  description: 'Read MARVVN return and refund policy - 3-day returns, no exchanges.',
}

export default function ReturnExchangePolicyPage() {
  const storeEmail = 'marvvnclothing@gmail.com'

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8 lg:py-12">
        <nav className="flex items-center gap-2 text-xs text-marvvn-gray-500 mb-6">
          <Link href="/" className="hover:text-marvvn-black">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-marvvn-black">Return & Refund Policy</span>
        </nav>

        <div className="max-w-3xl">
          <h1 className="text-2xl lg:text-3xl font-display font-medium mb-8">Return & Refund Policy</h1>
          <p className="text-xs text-marvvn-gray-400 mb-6">Last Updated: August, 2026</p>

          <div className="space-y-6 text-sm text-marvvn-gray-600 leading-relaxed">
            <p>
              At MARVVN, we want you to be satisfied with your purchase. Please read our return and
              refund policy carefully before placing an order.
            </p>

            <section>
              <h2 className="text-lg font-medium text-marvvn-black mb-3">1. Return Period</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Returns are accepted within 3 days of delivery only.</li>
                <li>Return requests submitted after 3 days will not be accepted.</li>
                <li>Products must be unused, unworn, unwashed, and in their original condition.</li>
                <li>The product must be returned with its original tags, packaging, and accessories.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-medium text-marvvn-black mb-3">2. Refund Policy</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>After receiving and inspecting the returned product, MARVVN will process the refund if it meets our return conditions.</li>
                <li>Only the product price will be refunded.</li>
                <li>Original delivery/shipping charges are non-refundable.</li>
                <li>Any applicable return shipping charges may be deducted from the refund amount.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-medium text-marvvn-black mb-3">3. Damaged or Used Products</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Damaged, worn, washed, stained, altered, or used products will not be accepted for return.</li>
                <li>If a product is received damaged or defective, the customer must contact MARVVN within 24 hours of delivery with clear photos/videos as proof.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-medium text-marvvn-black mb-3">4. Exchange</h2>
              <p>
                MARVVN currently does not offer exchanges. Eligible returns will be processed for a refund only.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-marvvn-black mb-3">5. Refund Processing</h2>
              <p>
                Once the returned product passes our quality inspection, the eligible refund will be initiated
                to the original payment method. Processing time may vary depending on the payment provider or bank.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-marvvn-black mb-3">6. Final Decision</h2>
              <p>
                MARVVN reserves the right to reject a return if the product does not meet the conditions mentioned above.
              </p>
            </section>
          </div>

          <p className="text-xs text-marvvn-gray-400 mt-10">MARVVN — Not Made To Fit In</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
