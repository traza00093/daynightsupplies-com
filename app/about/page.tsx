import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getStoreSettings } from '@/lib/settings'

export default async function AboutPage() {
  const settings = await getStoreSettings()

  return (
    <main>
      <Header />

      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">About {settings.storeName}</h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-600 mb-8">
              Your trusted partner for quality products and exceptional service, available around the clock.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
            <p className="text-gray-600 mb-6">
              Founded with a simple mission: to provide high-quality everyday essentials with unmatched customer service.
              {settings.storeName} has been serving customers with dedication and reliability since our inception.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 mb-6">
              We believe everyone deserves access to quality products at fair prices. Our carefully curated selection
              includes everything from home essentials to personal care items, all backed by our commitment to excellence.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Quality Guaranteed</h3>
                <p className="text-gray-600 text-sm">Every product is carefully selected and tested for quality.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">24/7 Support</h3>
                <p className="text-gray-600 text-sm">Our customer service team is always here to help.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Fast Shipping</h3>
                <p className="text-gray-600 text-sm">Quick and reliable delivery to your doorstep.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Easy Returns</h3>
                <p className="text-gray-600 text-sm">Hassle-free returns within 30 days.</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600">
              Have questions? We'd love to hear from you. Email us at <strong>{settings.storeEmail}</strong>.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
