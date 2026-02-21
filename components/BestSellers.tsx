'use client'

import { Star, ShoppingCart, Heart, Check } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

interface Product {
  id: number;
  name: string;
  price: number;
  original_price?: number;
  rating: number;
  reviews_count: number;
  image_url: string;
  category_name?: string;
  in_stock: boolean;
  stock_quantity?: number;
  sku?: string;
  weight?: number;
  dimensions?: string;
  tags?: string[];
  featured?: boolean;
}

function ProductActions({ product }: { product: Product }) {
  const { dispatch } = useCart()
  const { data: session } = useSession()
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const handleAddToCart = () => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        stock_quantity: product.stock_quantity || 0
      }
    })
    setToastMessage(`Added ${product.name} to cart`)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleWishlistToggle = async () => {
    if (!session) {
      window.location.href = '/auth/signin'
      return
    }

    try {
      if (isInWishlist) {
        const response = await fetch(`/api/wishlist?productId=${product.id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          setIsInWishlist(false)
        }
      } else {
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId: product.id })
        })
        if (response.ok) {
          setIsInWishlist(true)
        }
      }
    } catch (error) {
      console.error('Wishlist error:', error)
    }
  }

  return (
    <div className="flex gap-1 sm:gap-2">
      <button
        onClick={handleAddToCart}
        className="flex-1 bg-primary-500 hover:bg-primary-400 text-secondary-950 font-bold uppercase tracking-wider text-xs sm:text-sm shadow-lg shadow-primary-500/20 py-2 px-2 sm:px-4 rounded-lg transition-colors flex items-center justify-center space-x-1 sm:space-x-2"
      >
        <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
        <span className="hidden xs:inline sm:inline">Add to Cart</span>
        <span className="inline xs:hidden sm:hidden">Add</span>
      </button>
      <button
        onClick={handleWishlistToggle}
        className={`p-3 border rounded-md transition-colors ${isInWishlist
          ? 'border-red-500 bg-red-600 text-secondary-50'
          : 'border-secondary-600 bg-secondary-800 text-secondary-300 hover:text-red-400'
          }`}
      >
        <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
      </button>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-[9999] animate-slide-up">
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
    </div>
  )
}

export default function BestSellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        // For best sellers, we might want to fetch products with a specific sort order
        // or use a dedicated endpoint if available. For now, we'll fetch products
        // and potentially sort based on rating/sales data
        const response = await fetch('/api/products?limit=8');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setProducts(data.products);
          }
        }
      } catch (error) {
        console.error('Error fetching best sellers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-secondary-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-secondary-50 font-serif tracking-wide uppercase mb-12">
            Best Sellers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-secondary-900 rounded-lg shadow-sm border border-secondary-800">
                <div className="relative overflow-hidden rounded-t-lg bg-secondary-800 animate-pulse">
                  <div className="w-full h-64"></div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-secondary-800 rounded w-3/4"></div>
                  <div className="h-3 bg-secondary-800 rounded w-1/2"></div>
                  <div className="h-6 bg-secondary-800 rounded w-2/3 mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-secondary-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-secondary-50 font-serif tracking-wide uppercase mb-12">
          Best Sellers
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {products.map((product) => {
            // Calculate a badge based on product properties
            let badge;
            if (product.rating >= 4.5 && product.reviews_count > 50) {
              badge = 'Best Seller';
            } else if (product.reviews_count > 100) {
              badge = 'Popular';
            } else if (product.original_price && product.price < product.original_price) {
              badge = 'Sale';
            } else {
              badge = undefined;
            }

            return (
              <div key={product.id} className="bg-secondary-900 rounded-lg shadow-sm hover:shadow-md transition-shadow group border border-secondary-800">
                <a href={`/product/${product.id}`} className="block">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {badge && (
                      <span className={`absolute top-3 left-3 px-2 py-1 text-xs font-medium rounded ${badge === 'Best Seller' ? 'bg-green-100 text-green-800' :
                        badge === 'Popular' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                        {badge}
                      </span>
                    )}
                  </div>
                </a>
                <div className="p-2 sm:p-4">
                  <a href={`/product/${product.id}`}>
                    <h3 className="font-medium text-xs sm:text-base text-gray-100 mb-2 line-clamp-2 hover:text-secondary-300">{product.name}</h3>
                  </a>

                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 sm:h-4 sm:w-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-secondary-300'
                            }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs sm:text-sm text-secondary-400 ml-2">({product.reviews_count})</span>
                  </div>

                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <span className="text-sm sm:text-lg font-bold text-gray-100">${product.price}</span>
                      {product.original_price && (
                        <span className="text-xs sm:text-sm text-secondary-400 line-through">${product.original_price}</span>
                      )}
                    </div>
                  </div>

                  <ProductActions product={product} />
                </div>
              </div>
            );
          })}
        </div>
      </div >
    </section >
  )
}