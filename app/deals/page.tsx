'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Clock, Zap, ShoppingCart, Percent, Check } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

export default function DealsPage() {
  const { dispatch } = useCart()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 45,
    seconds: 30
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return { hours: 23, minutes: 59, seconds: 59 }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await fetch('/api/products?limit=20');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            const dealsWithDiscounts = data.products
              .map((product: any) => {
                let discount = 0;
                const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
                const originalPrice = typeof product.original_price === 'string' ? parseFloat(product.original_price) : product.original_price;

                if (originalPrice && originalPrice > price) {
                  discount = Math.round(((originalPrice - price) / originalPrice) * 100);
                }
                return {
                  ...product,
                  discount: discount,
                  originalPrice: originalPrice,
                  salePrice: price
                };
              })
              .filter((product: any) => product.discount > 0)
              .slice(0, 6);

            setDeals(dealsWithDiscounts);
          }
        }
      } catch (error) {
        console.error('Error fetching deals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  const handleAddToCart = (deal: any) => {
    const price = typeof deal.price === 'string' ? parseFloat(deal.price) : deal.price
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: deal.id,
        name: deal.name,
        price: price,
        image_url: deal.image_url,
        stock_quantity: typeof deal.stock_quantity === 'number' ? deal.stock_quantity : parseInt(deal.stock_quantity || '5')
      }
    })

    setToastMessage(`${deal.name} added to cart!`)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  return (
    <main className="bg-secondary-950 min-h-screen">
      <Header />

      <div className="bg-secondary-950 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-4">
            <Zap className="h-12 w-12 text-primary-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Deals of the Day</h1>
          <p className="text-xl text-secondary-300 mb-8">
            Limited time offers - Save up to 40% on selected items
          </p>

          <div className="bg-secondary-900 border border-secondary-800 rounded-lg p-6 max-w-md mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-white mr-2" />
              <span className="text-white font-semibold">Time Remaining:</span>
            </div>
            <div className="flex justify-center space-x-4 text-white">
              <div className="text-center">
                <div className="text-2xl font-bold bg-secondary-800 rounded px-3 py-2 text-primary-400">
                  {timeLeft.hours.toString().padStart(2, '0')}
                </div>
                <div className="text-xs mt-1 text-secondary-400">Hours</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold bg-secondary-800 rounded px-3 py-2 text-primary-400">
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </div>
                <div className="text-xs mt-1 text-secondary-400">Minutes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold bg-secondary-800 rounded px-3 py-2 text-primary-400">
                  {timeLeft.seconds.toString().padStart(2, '0')}
                </div>
                <div className="text-xs mt-1 text-secondary-400">Seconds</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="py-16 bg-secondary-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-secondary-900 rounded-lg shadow-lg overflow-hidden border border-secondary-800">
                  <div className="relative">
                    <div className="w-full h-48 bg-secondary-800 animate-pulse"></div>
                    <div className="absolute top-3 left-3 bg-red-500/90 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                      -20%
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="h-4 bg-secondary-800 rounded w-3/4 mb-4"></div>
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="h-6 bg-secondary-800 rounded w-1/3"></div>
                      <div className="h-4 bg-secondary-800 rounded w-1/4"></div>
                    </div>
                    <div className="h-10 bg-secondary-800 rounded w-full animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : deals.length === 0 ? (
            <div className="text-center py-12">
              <Zap className="h-16 w-16 text-secondary-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-secondary-400 mb-2">No deals available</h3>
              <p className="text-secondary-500">Check back later for special offers</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
              {deals.map((deal) => (
                <div key={deal.id} className="bg-secondary-900 rounded-lg shadow-lg overflow-hidden border border-secondary-800 group hover:border-primary-500/50 transition-colors">
                  <a href={`/product/${deal.id}`} className="block relative">
                    <img
                      src={deal.image_url || "https://placehold.co/400x400?text=Product"}
                      alt={deal.name}
                      className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500/90 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                      -{deal.discount}%
                    </div>
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-secondary-950/80 text-white px-1.5 sm:px-2 py-1 rounded text-[10px] sm:text-xs font-medium backdrop-blur-sm">
                      Only {typeof deal.stock_quantity === 'number' ? deal.stock_quantity : parseInt(deal.stock_quantity || '5')} left!
                    </div>
                  </a>

                  <div className="p-2 sm:p-6">
                    <a href={`/product/${deal.id}`} className="block hover:text-primary-400 transition-colors">
                      <h3 className="font-semibold text-white mb-2 sm:mb-3 text-xs sm:text-lg line-clamp-2">{deal.name}</h3>
                    </a>

                    <div className="flex items-center space-x-2 mb-2 sm:mb-4">
                      <span className="text-sm sm:text-2xl font-bold text-primary-400">${typeof deal.salePrice === 'number' ? deal.salePrice.toFixed(2) : parseFloat(deal.salePrice || '0').toFixed(2)}</span>
                      {deal.originalPrice && (
                        <span className="text-xs sm:text-lg text-secondary-500 line-through">${typeof deal.originalPrice === 'number' ? deal.originalPrice.toFixed(2) : parseFloat(deal.originalPrice || '0').toFixed(2)}</span>
                      )}
                    </div>

                    <div className="mb-2 sm:mb-4 hidden sm:block">
                      <div className="flex justify-between text-sm text-secondary-400 mb-1">
                        <span>Stock Level</span>
                        <span>{typeof deal.stock_quantity === 'number' ? deal.stock_quantity : parseInt(deal.stock_quantity || '5')} remaining</span>
                      </div>
                      <div className="w-full bg-secondary-800 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full shadow-[0_0_10px_rgba(201,120,100,0.5)]"
                          style={{ width: `${((typeof deal.stock_quantity === 'number' ? deal.stock_quantity : parseInt(deal.stock_quantity || '5')) / 20) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddToCart(deal)}
                      className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 sm:py-3 px-2 sm:px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1 sm:space-x-2 shadow-lg shadow-primary-500/20 text-xs sm:text-base"
                    >
                      <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Grab Deal</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="bg-secondary-900 py-16 border-t border-secondary-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Percent className="h-12 w-12 text-primary-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Never Miss a Deal</h2>
          <p className="text-secondary-300 mb-8">
            New deals every day at midnight. Set up notifications to be the first to know about flash sales and exclusive offers.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-secondary-950 p-6 rounded-lg shadow-sm border border-secondary-800">
              <div className="text-2xl mb-2">🔔</div>
              <h3 className="font-semibold text-white mb-2">Daily Notifications</h3>
              <p className="text-sm text-secondary-400">Get alerts for new deals</p>
            </div>
            <div className="bg-secondary-950 p-6 rounded-lg shadow-sm border border-secondary-800">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-semibold text-white mb-2">Flash Sales</h3>
              <p className="text-sm text-secondary-400">Limited time lightning deals</p>
            </div>
            <div className="bg-secondary-950 p-6 rounded-lg shadow-sm border border-secondary-800">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="font-semibold text-white mb-2">Exclusive Access</h3>
              <p className="text-sm text-secondary-400">Member-only special offers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div className="bg-secondary-900 border border-primary-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 max-w-sm">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <Check className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{toastMessage}</p>
            </div>
          </div>
        </div>
      )}


      <Footer />
    </main>
  )
}