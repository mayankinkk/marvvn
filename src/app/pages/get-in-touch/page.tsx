'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ChevronRight, Mail, Phone, MapPin, Send } from 'lucide-react'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8 lg:py-12">
        <nav className="flex items-center gap-2 text-xs text-marvvn-gray-500 mb-6">
          <Link href="/" className="hover:text-marvvn-black">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-marvvn-black">Contact</span>
        </nav>

        <h1 className="text-2xl lg:text-3xl font-display font-medium mb-8">Get in Touch</h1>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-medium mb-4">We&apos;d love to hear from you</h2>
              <p className="text-marvvn-gray-600">
                Have a question, suggestion, or just want to say hi? Drop us a message and we&apos;ll 
                get back to you as soon as possible.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-marvvn-gray-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-marvvn-gray-500" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Email</h3>
                  <a href="mailto:support@bonkerscorner.com" className="text-sm text-marvvn-gray-600 hover:text-marvvn-black transition-colors">
                    support@bonkerscorner.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-marvvn-gray-100 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-marvvn-gray-500" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Phone</h3>
                  <a href="tel:+918655700724" className="text-sm text-marvvn-gray-600 hover:text-marvvn-black transition-colors">
                    (+91) 8655700724
                  </a>
                  <p className="text-xs text-marvvn-gray-400 mt-0.5">Mon-Sat, 10AM - 7PM IST</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-marvvn-gray-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-marvvn-gray-500" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Address</h3>
                  <p className="text-sm text-marvvn-gray-600">
                    MARVVN<br />
                    Mumbai, Maharashtra<br />
                    India
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-medium text-sm mb-3">Follow Us</h3>
              <div className="flex gap-3">
                <a href="https://www.instagram.com/bonkers.corner/" target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-marvvn-gray-300 text-sm hover:border-marvvn-black transition-colors">
                  Instagram
                </a>
                <a href="https://www.facebook.com/TeamBonkerscorner" target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-marvvn-gray-300 text-sm hover:border-marvvn-black transition-colors">
                  Facebook
                </a>
                <a href="https://x.com/BonkersCornerX" target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-marvvn-gray-300 text-sm hover:border-marvvn-black transition-colors">
                  X
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            {submitted ? (
              <div className="border p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-medium mb-2">Message Sent!</h2>
                <p className="text-sm text-marvvn-gray-500 mb-6">
                  Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                </p>
                <Link href="/" className="btn-primary">Back to Home</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="border p-6 space-y-4">
                <h2 className="font-medium text-lg mb-4">Send a Message</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Message</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="input-field min-h-[150px] resize-y"
                    required
                  />
                </div>
                <button type="submit" className="w-full btn-primary py-3">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
