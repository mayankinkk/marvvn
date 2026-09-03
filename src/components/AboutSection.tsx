'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSettings } from '@/components/SettingsProvider'
import { Sparkles, Heart, Award, Leaf } from 'lucide-react'

const DEFAULT_VALUES = [
  { icon: Sparkles, label: 'CREATIVE EXPRESSION' },
  { icon: Heart, label: 'INCLUSIVITY' },
  { icon: Award, label: 'HIGH QUALITY' },
  { icon: Leaf, label: 'SUSTAINABILITY' },
]

const ICON_MAP: Record<string, any> = {
  sparkles: Sparkles,
  heart: Heart,
  award: Award,
  leaf: Leaf,
}

export default function AboutSection() {
  const settings = useSettings()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [subscribing, setSubscribing] = useState(false)

  const heading = settings.brand_story_heading || 'OUR STORY'
  const storyText = settings.brand_story_text ||
    'MARVVN isn\'t just a brand — it\'s a culture. Rooted in streetwear and individuality, we craft clothing that blends quality with affordability. From bold online drops to homegrown drops, we\'re building a community where fashion is fearless, inclusive, and unapologetically bold.'

  const values = [1, 2, 3, 4].map((i) => {
    const iconKey = settings[`brand_value_${i}_icon`] || ''
    const label = settings[`brand_value_${i}_label`] || DEFAULT_VALUES[i - 1].label
    const IconComp = ICON_MAP[iconKey.toLowerCase()] || DEFAULT_VALUES[i - 1].icon
    return { icon: IconComp, label }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || subscribing) return
    setSubscribing(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setSubscribed(true)
        setEmail('')
        setTimeout(() => setSubscribed(false), 3000)
      }
    } catch {}
    setSubscribing(false)
  }

  return (
    <section className="relative">
      <div className="grid lg:grid-cols-2 min-h-[600px]">
        <div className="relative bg-marvvn-gray-100 overflow-hidden">
          <Image
            src={settings.brand_story_image || '/images/brand-story.jpg'}
            alt="MARVVN brand story"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>
        <div className="bg-marvvn-black text-white flex items-center justify-center p-8 lg:p-16">
          <div className="max-w-lg text-center lg:text-left">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-2 tracking-wide">MARVVN</h2>
            <h3 className="text-xl md:text-2xl font-display font-semibold mb-6 tracking-widest uppercase">{heading}</h3>
            <p className="text-marvvn-gray-300 mb-10 text-base md:text-lg leading-relaxed">
              {storyText}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              {values.map((v, i) => (
                <div key={i} className="flex flex-col items-center lg:items-start gap-2">
                  <v.icon className="w-8 h-8 text-white" strokeWidth={1.5} />
                  <span className="text-[10px] md:text-xs font-semibold tracking-wider uppercase text-center lg:text-left">{v.label}</span>
                </div>
              ))}
            </div>
            <p className="text-sm font-medium mb-3">Join the club!</p>
            {subscribed ? (
              <div className="px-4 py-3 bg-green-600 text-white text-sm text-center">
                Thanks for subscribing!
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex max-w-md">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/50"
                  required
                />
                <button type="submit" disabled={subscribing} className="px-4 py-3 bg-white text-marvvn-black hover:bg-marvvn-gray-100 transition-colors disabled:opacity-50">
                  {subscribing ? '...' : 'Subscribe'}
                </button>
              </form>
            )}
            <Link href="/pages/about-us" className="inline-block mt-6 text-sm underline underline-offset-4 hover:text-marvvn-gray-300 transition-colors">
              Read our story
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
