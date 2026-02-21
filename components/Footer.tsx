'use client'

import { useState } from 'react'
import { Facebook, Instagram, Youtube, Twitter, CreditCard, Smartphone } from 'lucide-react'
import { useStoreSettings, formatAddress } from '@/contexts/StoreSettingsContext'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const settings = useStoreSettings()
  const address = formatAddress(settings)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await response.json()
      setMessage(data.message || 'Subscribed successfully!')
      setEmail('')
    } catch (error) {
      setMessage('Failed to subscribe. Please try again.')
    }
  }

  return (
    <footer className="bg-secondary-900 text-white border-t border-secondary-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li><a href="/about" className="text-sm text-secondary-600 hover:text-white transition-colors">About Us</a></li>
              <li><a href="/contact" className="text-sm text-secondary-600 hover:text-white transition-colors">Contact</a></li>
              <li><a href="/faq" className="text-sm text-secondary-600 hover:text-white transition-colors">FAQs</a></li>
              <li><a href="/privacy" className="text-sm text-secondary-600 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="text-sm text-secondary-600 hover:text-white transition-colors">Terms & Conditions</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Customer Service</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-sm text-secondary-600">
              <li className="flex items-start">
                <span className="mr-2 mt-0.5">✉️</span>
                <a href={`mailto:${settings.storeEmail}`} className="hover:text-white break-all">{settings.storeEmail}</a>
              </li>
              <li>🕒 24/7 Support Available</li>
              {address && <li>📍 {address}</li>}
            </ul>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Why Shop With Us?</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-sm text-secondary-600">
              <li>✅ 24/7 Customer Support</li>
              <li>✅ Fast & Secure Delivery</li>
              <li>✅ 100% Original Products</li>
              <li>✅ Easy Returns</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Newsletter</h3>
            <p className="text-sm text-secondary-600 mb-3 sm:mb-4">Subscribe for exclusive deals & updates</p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  required
                  className="flex-1 px-3 py-2.5 text-sm bg-secondary-900 border border-secondary-300 text-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                  type="submit"
                  className="bg-primary-500 hover:bg-primary-400 active:bg-primary-600 px-6 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-secondary-950"
                >
                  Subscribe
                </button>
              </div>
              {message && (
                <p className={`text-xs sm:text-sm ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
                  {message}
                </p>
              )}
            </form>
          </div>
        </div>

        <div className="border-t border-secondary-300 mt-6 sm:mt-8 pt-6 sm:pt-8">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <span className="text-sm text-secondary-600">Payment Methods:</span>
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-secondary-600" />
                <Smartphone className="h-5 w-5 text-secondary-600" />
                <span className="text-xs sm:text-sm text-secondary-600">Visa, MasterCard, PayPal, Apple Pay</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 sm:space-x-4">
              <span className="text-sm text-secondary-600">Follow Us:</span>
              <a href="#" className="text-secondary-600 hover:text-white transition-colors" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-secondary-600 hover:text-white transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-secondary-600 hover:text-white transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-secondary-600 hover:text-white transition-colors" aria-label="YouTube">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="text-center text-secondary-600 text-xs sm:text-sm mt-4">
            &copy; {new Date().getFullYear()} {settings.storeName}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
