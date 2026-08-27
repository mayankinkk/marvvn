'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function AboutSection() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  return (
    <section className="relative">
      <div className="grid lg:grid-cols-2 min-h-[500px]">
        <div className="relative">
          <img
            src="https://www.bonkerscorner.com/cdn/shop/files/our_story_750x1334.jpg?v=1769665909"
            alt="Bonkers Corner Story"
            className="hidden lg:block w-full h-full object-cover"
          />
          <img
            src="https://www.bonkerscorner.com/cdn/shop/files/our_story_750x1334.jpg?v=1769665909"
            alt="Bonkers Corner Story"
            className="lg:hidden w-full h-full object-cover aspect-[4/5]"
          />
        </div>
        <div className="bg-bonkers-black text-white flex items-center justify-center p-8 lg:p-16">
          <div className="max-w-md text-center lg:text-left">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold mb-4">TIME TO GET WEIRD</h2>
            <p className="text-bonkers-gray-300 mb-6 text-lg">
              If found possessed, blame the fashion.<br />
              The drop you didn&apos;t see coming
            </p>
            <p className="text-sm text-bonkers-gray-400 mb-6">#Devilsinthedetails</p>
            <p className="text-sm font-medium mb-3">Join the club!</p>
            {subscribed ? (
              <div className="px-4 py-3 bg-green-600 text-white text-sm text-center">
                Thanks for subscribing!
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/50"
                  required
                />
                <button type="submit" className="px-4 py-3 bg-white text-bonkers-black hover:bg-bonkers-gray-100 transition-colors">
                  Subscribe
                </button>
              </form>
            )}
            <Link href="/pages/about-us" className="inline-block mt-6 text-sm underline underline-offset-4 hover:text-bonkers-gray-300 transition-colors">
              Read our story
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
