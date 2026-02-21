import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BestSellers from '@/components/BestSellers'

export default function BestSellersPage() {
  return (
    <main>
      <Header />
      
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Best Sellers</h1>
          <p className="text-xl text-primary-100 mb-8">
            Discover our most popular products loved by thousands of customers
          </p>
          <div className="flex justify-center space-x-8 text-white">
            <div className="text-center">
              <div className="text-2xl font-bold">⭐ 4.8+</div>
              <div className="text-sm">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">10K+</div>
              <div className="text-sm">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">99%</div>
              <div className="text-sm">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>

      <BestSellers />

      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Why These Products Are Best Sellers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div>
              <div className="text-3xl mb-2">🏆</div>
              <h3 className="font-semibold text-gray-900">Top Quality</h3>
              <p className="text-gray-600 text-sm">Premium materials and craftsmanship</p>
            </div>
            <div>
              <div className="text-3xl mb-2">💝</div>
              <h3 className="font-semibold text-gray-900">Customer Favorite</h3>
              <p className="text-gray-600 text-sm">Highly rated and frequently repurchased</p>
            </div>
            <div>
              <div className="text-3xl mb-2">💰</div>
              <h3 className="font-semibold text-gray-900">Great Value</h3>
              <p className="text-gray-600 text-sm">Best price-to-quality ratio</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}