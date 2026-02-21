'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductReviews from '@/components/ProductReviews'
import ProductRecommendations from '@/components/ProductRecommendations'
import { useCart } from '@/contexts/CartContext'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import { Star, ShoppingCart, Heart, ArrowLeft, Plus, Minus, Package, Truck, Shield, Check } from 'lucide-react'

interface Product {
  id: number
  name: string
  description: string
  price: number
  original_price?: number
  rating: number
  reviews_count: number
  stock_quantity: number
  sku: string
  weight: number
  dimensions: string
  tags: string[]
  category_name: string
  images: Array<{
    id: number
    image_url: string
    alt_text: string
  }>
  variants: Array<{
    id: number
    name: string
    value: string
    price_modifier: number
    stock_quantity: number
  }>
}

export default function ProductDetailPage() {
  const params = useParams()
  const { data: session } = useSession()
  const { dispatch } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
    }
  }, [params.id])

  useRecentlyViewed(product?.id || 0, session?.user?.id ? Number(session.user.id) : undefined)

  const handleNextImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!product) return
    setSelectedImage((prev) => (prev + 1) % product.images.length)
    setZoomLevel(1)
  }, [product])

  const handlePrevImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!product) return
    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length)
    setZoomLevel(1)
  }, [product])

  const toggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation()
    setZoomLevel(prev => prev === 1 ? 2.5 : 1)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false)
      if (e.key === 'ArrowRight') handleNextImage()
      if (e.key === 'ArrowLeft') handlePrevImage()
    }
    if (isLightboxOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isLightboxOpen, handleNextImage, handlePrevImage])

  const fetchProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`)
      const data = await response.json()
      if (data.success) {
        setProduct(data.product)
      }
    } catch (error) {
      console.error('Failed to fetch product:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!product) return

    for (let i = 0; i < quantity; i++) {
      dispatch({
        type: 'ADD_ITEM',
        payload: {
          id: product.id,
          name: product.name,
          price: getCurrentPrice(),
          image_url: product.images[0]?.image_url || '',
          stock_quantity: product.stock_quantity
        }
      })
    }
    setToastMessage(`Added ${quantity} ${product.name} to cart`)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleWishlistToggle = async () => {
    if (!session || !product) {
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

  const getCurrentPrice = () => {
    if (!product) return 0
    let price = product.price
    Object.entries(selectedVariants).forEach(([variantName, variantValue]) => {
      const variant = product.variants.find(v => v.name === variantName && v.value === variantValue)
      if (variant) {
        price += variant.price_modifier
      }
    })
    return price
  }

  const getAvailableStock = () => {
    if (!product) return 0
    return product.stock_quantity
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-secondary-950 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
        <Footer />
      </>
    )
  }

  if (!product) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-secondary-950 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-secondary-50 mb-4">Product not found</h1>
            <a href="/" className="text-primary-400 hover:text-secondary-300">Back to Home</a>
          </div>
        </div>
        <Footer />
      </>
    )
  }



  const variantGroups = product.variants.reduce((acc, variant) => {
    if (!acc[variant.name]) {
      acc[variant.name] = []
    }
    acc[variant.name].push(variant)
    return acc
  }, {} as Record<string, typeof product.variants>)

  return (
    <>
      <Header />
      <div className="min-h-screen bg-secondary-950 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-secondary-400 hover:text-secondary-200 mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>

          <div className="bg-secondary-900 rounded-lg shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
              {/* Product Images */}
              <div>
                <div
                  className="aspect-square bg-secondary-800 rounded-lg overflow-hidden mb-4 cursor-zoom-in relative group"
                  onClick={() => setIsLightboxOpen(true)}
                >
                  <img
                    src={product.images[selectedImage]?.image_url || product.images[0]?.image_url}
                    alt={product.images[selectedImage]?.alt_text || product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                    <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                      <Plus className="h-4 w-4" /> Click to expand
                    </div>
                  </div>
                </div>
                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {product.images.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setSelectedImage(index)}
                        className={`aspect-square bg-secondary-800 rounded-lg overflow-hidden border-2 ${selectedImage === index ? 'border-primary-500' : 'border-transparent'
                          }`}
                      >
                        <img
                          src={image.image_url}
                          alt={image.alt_text}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div>
                <div className="mb-4">
                  <h1 className="text-3xl font-bold text-secondary-50 mb-2">{product.name}</h1>
                  <div className="flex items-center mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-secondary-600'
                            }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-secondary-400">({product.reviews_count} reviews)</span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center space-x-4 mb-2">
                    <span className="text-3xl font-bold text-secondary-50">${typeof getCurrentPrice() === 'number' ? getCurrentPrice().toFixed(2) : parseFloat(String(getCurrentPrice() || '0')).toFixed(2)}</span>
                    {product.original_price && (
                      <span className="text-xl text-gray-500 line-through">${typeof product.original_price === 'number' ? product.original_price.toFixed(2) : parseFloat(String(product.original_price || '0')).toFixed(2)}</span>
                    )}
                  </div>
                  <p className="text-secondary-300">{product.description}</p>
                </div>

                {/* Variants */}
                {Object.entries(variantGroups).map(([variantName, variants]) => (
                  <div key={variantName} className="mb-4">
                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                      {variantName}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariants(prev => ({
                            ...prev,
                            [variantName]: variant.value
                          }))}
                          className={`px-4 py-2 border rounded-md text-sm font-medium ${selectedVariants[variantName] === variant.value
                            ? 'border-primary-500 bg-primary-500 text-secondary-50'
                            : 'border-secondary-600 bg-secondary-800 text-secondary-300 hover:border-gray-500'
                            }`}
                        >
                          {variant.value}
                          {variant.price_modifier !== 0 && (
                            <span className="ml-1">
                              ({typeof variant.price_modifier === 'number' && variant.price_modifier > 0 ? '+' : ''}${typeof variant.price_modifier === 'number' ? variant.price_modifier.toFixed(2) : parseFloat(String(variant.price_modifier || '0')).toFixed(2)})
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Quantity */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 border border-secondary-600 rounded-md hover:bg-secondary-800 bg-secondary-900 text-secondary-50"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 border border-secondary-600 rounded-md min-w-[60px] text-center bg-secondary-900 text-secondary-50">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(getAvailableStock(), quantity + 1))}
                      className="p-2 border border-secondary-600 rounded-md hover:bg-secondary-800 bg-secondary-900 text-secondary-50"
                      disabled={quantity >= getAvailableStock()}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <span className="text-sm text-secondary-400">
                      {getAvailableStock()} in stock
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-4 mb-6">
                  <button
                    onClick={handleAddToCart}
                    disabled={getAvailableStock() === 0}
                    className="flex-1 bg-primary-500 text-secondary-50 py-3 px-6 rounded-md hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>{getAvailableStock() === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                  </button>
                  <button
                    onClick={handleWishlistToggle}
                    className={`p-3 border rounded-md ${isInWishlist
                      ? 'border-red-500 bg-red-600 text-secondary-50'
                      : 'border-secondary-600 bg-secondary-800 text-secondary-300 hover:text-red-400'
                      }`}
                  >
                    <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Product Details */}
                <div className="border-t border-secondary-700 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center space-x-2 text-sm text-secondary-400">
                      <Package className="h-4 w-4" />
                      <span>SKU: {product.sku}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-secondary-600">
                      <Truck className="h-4 w-4" />
                      <span>Free shipping</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-secondary-600">
                      <Shield className="h-4 w-4" />
                      <span>1 year warranty</span>
                    </div>
                  </div>

                  {product.tags && product.tags.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-secondary-300 mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-secondary-800 text-secondary-300 text-xs rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-secondary-300">Weight:</span>
                      <span className="ml-2 text-secondary-400">{product.weight || 'N/A'} lbs</span>
                    </div>
                    <div>
                      <span className="font-medium text-secondary-300">Dimensions:</span>
                      <span className="ml-2 text-secondary-400">{product.dimensions || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="bg-secondary-900 rounded-lg shadow-sm mt-8 p-6">
            <ProductReviews
              productId={product.id}
              userId={session?.user?.id ? Number(session.user.id) : undefined}
            />
          </div>

          {/* Recommendations */}
          <ProductRecommendations
            productId={product.id}
            title="Related Products"
          />
        </div>
      </div>
      <Footer />

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

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center backdrop-blur-sm" onClick={() => setIsLightboxOpen(false)}>
          <button
            className="absolute top-4 right-4 text-white p-2 z-50 bg-black/40 rounded-full hover:bg-black/60 transition-colors"
            onClick={() => setIsLightboxOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>

          {/* Navigation */}
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-3 z-50 bg-black/40 rounded-full hover:bg-black/60 transition-colors"
            onClick={handlePrevImage}
          >
            <ArrowLeft className="h-8 w-8" />
          </button>

          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-3 z-50 bg-black/40 rounded-full hover:bg-black/60 transition-colors"
            onClick={handleNextImage}
          >
            <ArrowLeft className="h-8 w-8 rotate-180" />
          </button>

          {/* Image Container */}
          <div
            className="w-full h-full flex items-center justify-center overflow-hidden cursor-move"
            onClick={toggleZoom}
          >
            <img
              src={product.images[selectedImage]?.image_url || product.images[0]?.image_url}
              alt={product.name}
              className="max-w-[90vw] max-h-[90vh] object-contain transition-transform duration-300 ease-out select-none"
              style={{ transform: `scale(${zoomLevel})` }}
              draggable={false}
            />
          </div>

          {/* Zoom Controls Overlay */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50 bg-black/40 px-6 py-2 rounded-full text-white/90" onClick={e => e.stopPropagation()}>
            <button onClick={(e) => { e.stopPropagation(); setZoomLevel(prev => Math.max(1, prev - 0.5)); }} className="hover:text-primary-400 p-1"><Minus className="h-6 w-6" /></button>
            <span className="min-w-[3ch] text-center font-medium">{Math.round(zoomLevel * 100)}%</span>
            <button onClick={(e) => { e.stopPropagation(); setZoomLevel(prev => Math.min(4, prev + 0.5)); }} className="hover:text-primary-400 p-1"><Plus className="h-6 w-6" /></button>
          </div>

          {/* Image Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/90 bg-black/40 px-4 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
            {selectedImage + 1} / {product.images.length}
          </div>
        </div>
      )}
    </>
  )
}