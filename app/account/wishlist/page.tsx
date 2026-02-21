'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useCart } from '@/contexts/CartContext'
import { Heart, ArrowLeft, ShoppingCart, Star, Trash2 } from 'lucide-react'

interface WishlistItem {
  id: number
  product_id: number
  name: string
  price: number
  image_url: string
  rating: number
  reviews_count: number
  stock_quantity?: number
  created_at: string
}

export default function WishlistPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { dispatch } = useCart()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
    fetchWishlist()
  }, [session, status])

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist')
      const data = await response.json()
      if (data.items) {
        setWishlistItems(data.items)
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromWishlist = async (productId: number) => {
    try {
      const response = await fetch(`/api/wishlist?productId=${productId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setWishlistItems(prev => prev.filter(item => item.product_id !== productId))
      }
    } catch (error) {
      console.error('Failed to remove from wishlist:', error)
    }
  }

  const addToCart = (item: WishlistItem) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: item.product_id,
        name: item.name,
        price: item.price,
        image_url: item.image_url,
        stock_quantity: item.stock_quantity || 10
      }
    })
  }

  if (status === 'loading' || isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
        <Footer />
      </>
    )
  }

  if (!session) return null

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-8">
            <button
              onClick={() => router.push('/account')}
              className="mr-4 p-2 text-gray-400 hover:text-gray-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-white">My Wishlist</h1>
          </div>

          {!wishlistItems || wishlistItems.length === 0 ? (
            <div className="bg-gray-800 rounded-lg shadow p-8 text-center">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Your wishlist is empty</h3>
              <p className="text-gray-400 mb-4">Save items you love for later.</p>
              <a
                href="/"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Start Shopping
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {wishlistItems.map((item) => (
                <div key={item.id} className="bg-secondary-900 rounded-lg shadow hover:shadow-md transition-shadow group border border-secondary-800">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={() => removeFromWishlist(item.product_id)}
                      className="absolute top-2 right-2 p-1.5 sm:p-2 bg-secondary-950/80 rounded-full shadow-md hover:bg-secondary-900 backdrop-blur-sm"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                    </button>
                  </div>

                  <div className="p-2 sm:p-4">
                    <h3 className="font-medium text-xs sm:text-base text-secondary-50 mb-1 sm:mb-2 line-clamp-2 hover:text-secondary-300 transition-colors">
                      {item.name}
                    </h3>

                    <div className="flex items-center mb-1 sm:mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 sm:h-4 sm:w-4 ${i < Math.floor(item.rating) ? 'text-yellow-400 fill-current' : 'text-secondary-600'
                              }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs sm:text-sm text-secondary-400 ml-1">({item.reviews_count})</span>
                    </div>

                    <div className="flex items-center justify-between mb-2 sm:mb-4">
                      <span className="text-sm sm:text-lg font-bold text-secondary-50">${typeof item.price === 'number' ? item.price.toFixed(2) : parseFloat(item.price).toFixed(2)}</span>
                    </div>

                    <button
                      onClick={() => addToCart(item)}
                      className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 px-2 sm:px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1 sm:space-x-2 shadow-lg shadow-primary-500/20 text-xs sm:text-base"
                    >
                      <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}