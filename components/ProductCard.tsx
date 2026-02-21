'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useCart } from '@/contexts/CartContext'
import { useComparison } from '@/contexts/ComparisonContext'
import { Star, ShoppingCart, Heart, Eye, MinusCircle, PlusCircle, Check } from 'lucide-react'

interface Product {
  id: number
  name: string
  description: string
  price: number
  original_price?: number
  rating: number
  reviews_count: number
  image_url: string
  stock_quantity: number
  in_stock?: boolean
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { data: session } = useSession()
  const { dispatch } = useCart()
  const { state: comparisonState, dispatch: comparisonDispatch } = useComparison()
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const isInComparison = comparisonState.items.some(item => item.id === product.id)
  const isOutOfStock = (product.stock_quantity === 0) || (product.in_stock === false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        stock_quantity: product.stock_quantity
      }
    })
    setToastMessage(`Added ${product.name} to cart`)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
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

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isInComparison) {
      comparisonDispatch({ type: 'REMOVE_ITEM', payload: product.id })
    } else {
      comparisonDispatch({
        type: 'ADD_ITEM',
        payload: {
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url
        }
      })
    }
  }

  return (
    <div className="bg-secondary-900 border border-secondary-800 rounded-lg shadow-sm hover:shadow-md transition-shadow group">
      <div className="relative overflow-hidden rounded-t-lg">
        <a href={`/product/${product.id}`}>
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </a>

        {/* Quick Actions - Hidden on mobile, shown on hover on desktop */}
        <div className="absolute top-2 right-2 flex flex-col space-y-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleWishlistToggle}
            className={`p-2 rounded-full shadow-md transition-colors touch-manipulation ${isInWishlist
              ? 'bg-red-900 text-red-100 border border-red-800'
              : 'bg-secondary-900 border border-secondary-800 text-secondary-400 hover:text-red-500 active:bg-gray-100'
              }`}
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
          </button>
          <a
            href={`/product/${product.id}`}
            className="p-2 bg-secondary-900 border border-secondary-800 text-secondary-400 hover:text-secondary-50 active:bg-gray-100 rounded-full shadow-md transition-colors touch-manipulation"
            aria-label="View product"
          >
            <Eye className="h-4 w-4" />
          </a>
          <button
            onClick={handleCompareToggle}
            className={`p-2 rounded-full shadow-md transition-colors touch-manipulation ${isInComparison
              ? 'bg-primary-500 text-white'
              : 'bg-secondary-900 border border-secondary-800 text-secondary-400 hover:text-primary-500 active:bg-gray-100'
              }`}
            aria-label={isInComparison ? 'Remove from comparison' : 'Add to comparison'}
          >
            {isInComparison ? (
              <MinusCircle className="h-4 w-4" />
            ) : (
              <PlusCircle className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Stock Badge */}
        {isOutOfStock && (
          <div className="absolute top-2 left-2">
            <span className="bg-red-900 text-red-100 border border-red-800 text-xs px-2 py-1 rounded-md">
              Out of Stock
            </span>
          </div>
        )}

        {/* Sale Badge */}
        {product.original_price && product.original_price > product.price && (
          <div className="absolute top-2 left-2">
            <span className="bg-red-900 text-red-100 border border-red-800 text-xs px-2 py-1 rounded-md">
              Sale
            </span>
          </div>
        )}
      </div>

      <div className="p-2 sm:p-4">
        <a href={`/product/${product.id}`}>
          <h3 className="font-medium text-xs sm:text-base text-secondary-50 mb-2 line-clamp-2 hover:text-gray-700">
            {product.name}
          </h3>
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

        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-base sm:text-lg font-bold text-secondary-50">${product.price.toFixed(2)}</span>
            {product.original_price && (
              <span className="text-xs sm:text-sm text-secondary-500 line-through">${product.original_price.toFixed(2)}</span>
            )}
          </div>
          <span className="text-xs text-secondary-500">
            {product.stock_quantity !== undefined && product.stock_quantity < 10 && product.stock_quantity > 0 && (
              <span className="text-xs text-red-500 font-medium">
                Only {product.stock_quantity} left!
              </span>
            )}
            {product.stock_quantity !== undefined && product.stock_quantity >= 10 && (
              <span className="text-xs text-green-600">
                In Stock
              </span>
            )}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="flex-1 bg-primary-500 text-secondary-950 hover:bg-primary-400 active:bg-primary-600 shadow-lg shadow-primary-500/20 uppercase tracking-wide font-bold py-2 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1 sm:space-x-2 touch-manipulation"
          >
            <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="truncate">{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
          </button>
          <button
            onClick={handleCompareToggle}
            className={`sm:w-auto w-full p-2.5 sm:p-3 rounded-lg font-medium transition-colors flex items-center justify-center touch-manipulation ${isInComparison
              ? 'bg-primary-900/40 text-primary-300 border border-primary-800'
              : 'bg-secondary-800 text-secondary-200 hover:bg-secondary-700 active:bg-secondary-600 border border-secondary-700'
              }`}
            aria-label={isInComparison ? 'Remove from comparison' : 'Add to comparison'}
          >
            {isInComparison ? (
              <MinusCircle className="h-4 w-4" />
            ) : (
              <PlusCircle className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-[100] animate-slide-up">
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
