'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ChevronRight } from 'lucide-react'

export default function AboutUsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8 lg:py-12">
        <nav className="flex items-center gap-2 text-xs text-bonkers-gray-500 mb-6">
          <Link href="/" className="hover:text-bonkers-black">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-bonkers-black">About Us</span>
        </nav>

        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl lg:text-3xl font-display font-medium mb-8">About Bonkers Corner</h1>

          <div className="aspect-[16/9] bg-bonkers-gray-50 overflow-hidden mb-8">
            <img
              src="https://www.bonkerscorner.com/cdn/shop/files/our_story_750x1334.jpg?v=1769665909"
              alt="Bonkers Corner Story"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-6 text-bonkers-gray-600">
            <p className="text-lg leading-relaxed">
              Born from the streets and built for the bold, Bonkers Corner is not just a clothing brand — 
              it&apos;s a movement. We started with one simple idea: fashion should be fun, fearless, and 
              unapologetically YOU.
            </p>

            <h2 className="text-xl font-display font-medium text-bonkers-black pt-4">Our Story</h2>
            <p className="leading-relaxed">
              What began as a small passion project quickly grew into a community of thousands who share 
              our love for streetwear that doesn&apos;t take itself too seriously. From oversized tees 
              that make a statement to joggers that move with you, every piece is designed with purpose 
              and a whole lot of personality.
            </p>

            <h2 className="text-xl font-display font-medium text-bonkers-black pt-4">Our Mission</h2>
            <p className="leading-relaxed">
              We believe luxury streetwear shouldn&apos;t cost a fortune. Our mission is to make premium 
              fashion accessible to everyone who wants to express themselves through what they wear. 
              Quality fabrics, bold designs, and prices that don&apos;t break the bank — that&apos;s the 
              Bonkers promise.
            </p>

            <h2 className="text-xl font-display font-medium text-bonkers-black pt-4">Made in India</h2>
            <p className="leading-relaxed">
              Every Bonkers Corner piece is proudly designed and made in India. We work with local 
              manufacturers and artisans to bring you the best quality while supporting our homegrown 
              talent and industry.
            </p>

            <div className="bg-bonkers-black text-white p-8 mt-8">
              <p className="text-xl font-display font-bold text-center mb-2">TIME TO GET WEIRD</p>
              <p className="text-center text-bonkers-gray-300 text-sm">
                #Devilsinthedetails
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <p className="text-3xl font-display font-bold mb-2">50K+</p>
                <p className="text-sm text-bonkers-gray-500">Happy Customers</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-display font-bold mb-2">500+</p>
                <p className="text-sm text-bonkers-gray-500">Products</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-display font-bold mb-2">4.8</p>
                <p className="text-sm text-bonkers-gray-500">Average Rating</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
