import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ChevronRight } from 'lucide-react'

export const metadata = {
  title: 'About Us | MARVVN',
  description: 'Learn about MARVVN - our story, mission, and commitment to quality at fair prices.',
}

export default function AboutUsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8 lg:py-12">
        <nav className="flex items-center gap-2 text-xs text-marvvn-gray-500 mb-6">
          <Link href="/" className="hover:text-marvvn-black">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-marvvn-black">About Us</span>
        </nav>

        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl lg:text-3xl font-display font-medium mb-8">About MARVVN</h1>

          <div className="space-y-6 text-marvvn-gray-600">
            <p className="text-lg leading-relaxed">
              MARVVN was born from a simple belief — everyone deserves good quality at a fair price.
              What started with our own struggle to find quality products at affordable prices has
              become our mission to bring style, quality, and value closer to everyone.
            </p>

            <h2 className="text-xl font-display font-medium text-marvvn-black pt-4">Our Story</h2>
            <p className="leading-relaxed">
              MARVVN began with a journey we experienced ourselves.
            </p>
            <p className="leading-relaxed">
              As hostel students, finding good-quality products at the right price was never easy.
              We often had to travel 60–70 km to reach better markets, only to find that quality came
              at a higher price.
            </p>
            <p className="leading-relaxed">
              That experience made us think about the countless people who live far from big markets,
              have busy lives, or simply want quality without paying more than they can afford.
            </p>
            <p className="leading-relaxed">
              So, we decided to change that.
            </p>
            <p className="leading-relaxed">
              MARVVN was born with a simple belief: quality and style should be accessible to
              everyone, no matter where they live.
            </p>

            <h2 className="text-xl font-display font-medium text-marvvn-black pt-4">Our Mission</h2>
            <p className="leading-relaxed">
              Our mission is to bring quality, style, and affordability closer to every customer.
              Through MARVVN, we aim to make good products more accessible and offer better value
              for those who deserve more from what they spend.
            </p>

            <div className="bg-marvvn-black text-white py-12 px-8 mt-8">
              <p className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-center tracking-wide">NOT MADE TO FIT IN</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
