import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ChevronRight } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy | MARVVN',
  description: 'Read MARVVN privacy policy - how we collect, use, and protect your data.',
}

export default function PrivacyPolicyPage() {
  const storeEmail = 'marvvnclothing@gmail.com'
  const storeName = 'MARVVN'
  const storeAddress = 'India'
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8 lg:py-12">
        <nav className="flex items-center gap-2 text-xs text-marvvn-gray-500 mb-6">
          <Link href="/" className="hover:text-marvvn-black">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-marvvn-black">Privacy Policy</span>
        </nav>

        <div className="max-w-3xl">
          <h1 className="text-2xl lg:text-3xl font-display font-medium mb-8">Privacy Policy</h1>

          <div className="space-y-6 text-sm text-marvvn-gray-600 leading-relaxed">
            <p><strong>Last updated:</strong> August 2026</p>

            <section>
              <h2 className="text-lg font-medium text-marvvn-black mb-3">1. Information We Collect</h2>
              <p>
                We collect information you provide directly: name, email, phone number, shipping 
                address, and payment details. We also automatically collect device information, 
                browsing behavior, and cookies when you visit our website.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-marvvn-black mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>To process and fulfill your orders</li>
                <li>To send order updates and shipping notifications</li>
                <li>To provide customer support</li>
                <li>To send marketing communications (with your consent)</li>
                <li>To improve our website and services</li>
                <li>To detect and prevent fraud</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-medium text-marvvn-black mb-3">3. Information Sharing</h2>
              <p>
                We do not sell your personal information. We share data only with:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Payment processors for transaction handling</li>
                <li>Shipping partners for order delivery</li>
                <li>Analytics providers to improve our services</li>
                <li>Law enforcement when required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-medium text-marvvn-black mb-3">4. Cookies</h2>
              <p>
                We use cookies to enhance your browsing experience, analyze site traffic, and 
                personalize content. You can control cookies through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-marvvn-black mb-3">5. Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your personal 
                information. However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-marvvn-black mb-3">6. Your Rights</h2>
              <p>
                You have the right to access, correct, or delete your personal information. 
                To exercise these rights, contact us at {storeEmail}.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-marvvn-black mb-3">7. Data Retention</h2>
              <p>
                We retain your information for as long as your account is active or as needed 
                to provide services. We will also retain data as necessary to comply with legal 
                obligations.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-marvvn-black mb-3">8. Changes to This Policy</h2>
              <p>
                We may update this policy from time to time. We will notify you of any 
                material changes by posting the new policy on this page.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-marvvn-black mb-3">9. Contact Us</h2>
              <p>
                For privacy-related inquiries, contact us at {storeEmail} or 
                write to us at {storeName}, {storeAddress}.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
