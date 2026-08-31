import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ChevronRight } from 'lucide-react'

export const metadata = {
  title: 'Terms & Conditions | MARVVN',
  description: 'Read MARVVN terms and conditions for using our website and services.',
}

export default function TermsPage() {
  const storeEmail = 'marvvnclothing@gmail.com'
  const storePhone = '7578017237'
  const storeAddress = 'Faridabad'

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8 lg:py-12">
        <nav className="flex items-center gap-2 text-xs text-marvvn-gray-500 mb-6">
          <Link href="/" className="hover:text-marvvn-black">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-marvvn-black">Terms & Conditions</span>
        </nav>

        <div className="max-w-3xl">
          <h1 className="text-2xl lg:text-3xl font-display font-medium mb-8">Terms & Conditions</h1>

          <div className="space-y-6 text-sm text-marvvn-gray-600 leading-relaxed">
            <p><strong>Last Updated:</strong> August 2026</p>

            <section>
              <h2 className="text-lg font-medium text-marvvn-black mb-3">1. About MARVVN</h2>
              <p>
                Welcome to MARVVN. By accessing or using our website and purchasing products from us, you agree to be bound by these Terms &amp; Conditions.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-marvvn-black mb-3">2. Acceptance of Terms</h2>
              <p>
                By using our website, creating an account, or placing an order, you agree to these Terms &amp; Conditions. If you do not agree with any part of these terms, please do not use our website or services.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-marvvn-black mb-3">3. Products</h2>
              <p>
                We make every effort to display product images, colours, sizes, descriptions, and prices accurately. However, the actual colour of a product may vary slightly due to screen settings, photography, lighting, or other technical factors. Product availability is subject to change without notice.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-marvvn-black mb-3">4. Pricing</h2>
              <p>
                All prices are displayed in Indian Rupees (₹) and are subject to change without prior notice. Applicable taxes and shipping charges, if any, will be shown at checkout. MARVVN reserves the right to correct any pricing errors or inaccuracies.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-marvvn-black mb-3">5. Orders</h2>
              <p className="mb-3">
                Placing an order does not guarantee acceptance. MARVVN reserves the right to accept, reject, cancel, or limit any order at its sole discretion, including in cases of:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Incorrect pricing or product information</li>
                <li>Product unavailability</li>
                <li>Suspected fraudulent or unauthorized transactions</li>
                <li>Incorrect customer information</li>
                <li>Violation of these Terms &amp; Conditions</li>
              </ul>
              <p className="mt-3">
                If payment has already been made for a cancelled order, an applicable refund will be processed according to our refund policy.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-marvvn-black mb-3">6. Payments</h2>
              <p>
                We may accept payment through authorized payment methods available on our website. By completing a transaction, you confirm that the payment information provided by you is accurate and that you are authorized to use the selected payment method.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-marvvn-black mb-3">7. Cash on Delivery</h2>
              <p>
                Cash on Delivery (COD), where available, may be subject to additional verification or conditions. MARVVN reserves the right to restrict or refuse COD for certain customers, locations, orders, or products.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-marvvn-black mb-3">8. Shipping &amp; Delivery</h2>
              <p className="mb-3">
                Orders will be processed and dispatched within the estimated timeframe mentioned on our website. Delivery timelines are estimates and may vary due to:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Courier or logistics delays</li>
                <li>Weather conditions</li>
                <li>Public holidays</li>
                <li>Incorrect or incomplete delivery addresses</li>
                <li>Events beyond our reasonable control</li>
              </ul>
              <p className="mt-3">
                MARVVN shall not be responsible for delays caused by third-party courier or logistics partners.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-marvvn-black mb-3">9. Cancellation</h2>
              <p>
                Orders may be cancelled before dispatch, subject to our cancellation policy. Once an order has been shipped, it may not be cancelled. MARVVN reserves the right to cancel orders when necessary.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-marvvn-black mb-3">10. Returns &amp; Exchanges</h2>
              <p>
                Returns and exchanges are subject to our Return &amp; Exchange Policy. Generally, returned products must:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Be unused, unworn, unwashed, and undamaged</li>
                <li>Have original tags and packaging intact</li>
                <li>Meet the eligibility period mentioned in our Return Policy</li>
              </ul>
              <p className="mt-3">
                Certain products may not be eligible for return or exchange due to hygiene, customization, sale, or other applicable reasons.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-marvvn-black mb-3">11. Refunds</h2>
              <p>
                Approved refunds will be processed through the original payment method or another applicable method, as per our Refund Policy. Processing time may vary depending on banks and payment service providers. Shipping, COD, convenience, or other charges may be non-refundable unless otherwise stated.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-marvvn-black mb-3">12. Account Responsibility</h2>
              <p>
                If you create an account with MARVVN, you are responsible for maintaining the confidentiality of your account information and password. You agree to provide accurate and updated information. MARVVN reserves the right to suspend or terminate accounts involved in fraudulent, abusive, or unlawful activities.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-marvvn-black mb-3">13. Intellectual Property</h2>
              <p>
                The MARVVN name, logo, designs, graphics, website content, photographs, product designs, and other brand materials are the intellectual property of MARVVN or their respective owners. You may not copy, reproduce, distribute, modify, or use our intellectual property without prior written permission.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-marvvn-black mb-3">14. User Conduct</h2>
              <p className="mb-3">You agree not to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use the website for illegal or fraudulent purposes</li>
                <li>Interfere with the security or operation of the website</li>
                <li>Attempt unauthorized access to our systems</li>
                <li>Copy or misuse MARVVN content or designs</li>
                <li>Submit false or misleading information</li>
                <li>Abuse or harass our employees, representatives, or service partners</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-medium text-marvvn-black mb-3">15. Third-Party Services</h2>
              <p>
                Our website may use third-party services such as payment gateways, delivery partners, analytics services, and social media platforms. Their services may be governed by their own terms and policies.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-marvvn-black mb-3">16. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by applicable law, MARVVN shall not be liable for indirect, incidental, special, or consequential damages arising from the use of our website or products. Nothing in these Terms is intended to limit any rights that cannot legally be excluded under applicable consumer protection laws.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-marvvn-black mb-3">17. Privacy</h2>
              <p>
                Your use of MARVVN is also subject to our Privacy Policy, which explains how we collect, use, and protect personal information.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-marvvn-black mb-3">18. Changes to Terms</h2>
              <p>
                MARVVN may update or modify these Terms &amp; Conditions from time to time. Updated terms will be published on our website with the revised date.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-marvvn-black mb-3">19. Contact Us</h2>
              <p className="mb-3">For any questions, complaints, or support, please contact us:</p>
              <ul className="space-y-1">
                <li>
                  Brand Name: <span className="text-marvvn-black font-medium">MARVVN</span>
                </li>
                <li>
                  Email:{' '}
                  <a href={`mailto:${storeEmail}`} className="underline hover:text-marvvn-black">{storeEmail}</a>
                </li>
                <li>
                  Phone:{' '}
                  <a href={`tel:${storePhone.replace(/\s/g, '')}`} className="underline hover:text-marvvn-black">{storePhone}</a>
                </li>
<li>Business Address: {storeAddress}</li>
              </ul>
            </section>

            <p className="pt-4 text-marvvn-gray-500">© 2026 MARVVN. All Rights Reserved.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}