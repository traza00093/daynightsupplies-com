'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { X, Minus, Plus, Star } from 'lucide-react'

interface Product {
  id: number
  name: string
  description: string
  price: number
  original_price?: number
  rating: number
  reviews_count: number
  image_url: string
  category_name: string
  stock_quantity: number
  in_stock: boolean
  weight: number | null
  dimensions: string | null
  tags: string[]
  image_urls: string[]
}

export default function ComparePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const productIdsParam = searchParams.get('ids') || ''
  
  useEffect(() => {
    if (productIdsParam) {
      fetchProductsForComparison()
    } else {
      setProducts([])
      setLoading(false)
    }
  }, [productIdsParam])

  const fetchProductsForComparison = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/compare?ids=${productIdsParam}`)
      const data = await response.json()
      
      if (data.success) {
        setProducts(data.products)
      } else {
        setError(data.error || 'Failed to fetch products for comparison')
      }
    } catch (err) {
      setError('An error occurred while fetching products')
      console.error('Error fetching products for comparison:', err)
    } finally {
      setLoading(false)
    }
  }

  const removeProduct = (productId: number) => {
    const currentIds = productIdsParam.split(',').map(id => parseInt(id))
    const updatedIds = currentIds.filter(id => id !== productId)
    
    if (updatedIds.length > 0) {
      router.push(`/compare?ids=${updatedIds.join(',')}`)
    } else {
      router.push('/search') // Redirect if no products left to compare
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => router.push('/search')}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Back to Search
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (products.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Comparison</h1>
              <p className="text-gray-600 mb-6">No products to compare. Add products to compare them.</p>
              <button
                onClick={() => router.push('/search')}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Browse Products
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  // Get all unique attributes to compare across products
  const allAttributes = new Set<string>()
  products.forEach(product => {
    if (product.weight) allAttributes.add('weight')
    if (product.dimensions) allAttributes.add('dimensions')
    if (product.tags && product.tags.length > 0) allAttributes.add('tags')
  })

  // Render stars for rating
  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Product Comparison</h1>
            <button
              onClick={() => router.push('/search')}
              className="text-blue-600 hover:text-blue-800"
            >
              Back to Search
            </button>
          </div>

          {/* Comparison table */}
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            {/* Product names row */}
            <div className="flex border-b border-gray-200 min-w-max">
              <div className="w-48 p-4 font-semibold bg-gray-50">Product</div>
              {products.map(product => (
                <div key={product.id} className="flex-1 p-4 bg-gray-50 min-w-[280px]">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.category_name}</p>
                    </div>
                    <button
                      onClick={() => removeProduct(product.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Images row */}
            <div className="flex border-b border-gray-200 min-w-max">
              <div className="w-48 p-4 font-medium text-gray-700">Image</div>
              {products.map(product => (
                <div key={product.id} className="flex-1 p-4 min-w-[280px]">
                  <div className="flex justify-center">
                    <img
                      src={product.image_url || product.image_urls?.[0] || '/images/placeholder.png'}
                      alt={product.name}
                      className="h-32 w-32 object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Price row */}
            <div className="flex border-b border-gray-200 min-w-max">
              <div className="w-48 p-4 font-medium text-gray-700">Price</div>
              {products.map(product => (
                <div key={product.id} className="flex-1 p-4 min-w-[280px]">
                  <div className="text-lg font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                  </div>
                  {product.original_price && product.original_price > product.price && (
                    <div className="text-sm text-red-600 line-through">
                      ${product.original_price.toFixed(2)}
                    </div>
                  )}
                  {!product.in_stock && (
                    <div className="text-sm text-red-600 mt-1">Out of Stock</div>
                  )}
                </div>
              ))}
            </div>

            {/* Rating row */}
            <div className="flex border-b border-gray-200 min-w-max">
              <div className="w-48 p-4 font-medium text-gray-700">Rating</div>
              {products.map(product => (
                <div key={product.id} className="flex-1 p-4 min-w-[280px]">
                  {renderRating(product.rating)}
                  <div className="text-sm text-gray-500 mt-1">
                    {product.reviews_count} reviews
                  </div>
                </div>
              ))}
            </div>

            {/* Availability row */}
            <div className="flex border-b border-gray-200 min-w-max">
              <div className="w-48 p-4 font-medium text-gray-700">Availability</div>
              {products.map(product => (
                <div key={product.id} className="flex-1 p-4 min-w-[280px]">
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    product.in_stock 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.in_stock ? 'In Stock' : 'Out of Stock'}
                  </div>
                  {product.in_stock && product.stock_quantity !== null && (
                    <div className="text-sm text-gray-500 mt-1">
                      {product.stock_quantity} available
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Weight row */}
            {allAttributes.has('weight') && (
              <div className="flex border-b border-gray-200 min-w-max">
                <div className="w-48 p-4 font-medium text-gray-700">Weight</div>
                {products.map(product => (
                  <div key={product.id} className="flex-1 p-4 min-w-[280px]">
                    {product.weight ? `${product.weight} lbs` : '-'}
                  </div>
                ))}
              </div>
            )}

            {/* Dimensions row */}
            {allAttributes.has('dimensions') && (
              <div className="flex border-b border-gray-200 min-w-max">
                <div className="w-48 p-4 font-medium text-gray-700">Dimensions</div>
                {products.map(product => (
                  <div key={product.id} className="flex-1 p-4 min-w-[280px]">
                    {product.dimensions ? product.dimensions : '-'}
                  </div>
                ))}
              </div>
            )}

            {/* Tags row */}
            {allAttributes.has('tags') && (
              <div className="flex border-b border-gray-200 min-w-max">
                <div className="w-48 p-4 font-medium text-gray-700">Tags</div>
                {products.map(product => (
                  <div key={product.id} className="flex-1 p-4 min-w-[280px]">
                    {product.tags && product.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {product.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      '-'
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Description row */}
            <div className="flex border-b border-gray-200 min-w-max">
              <div className="w-48 p-4 font-medium text-gray-700">Description</div>
              {products.map(product => (
                <div key={product.id} className="flex-1 p-4 min-w-[280px]">
                  <p className="text-sm text-gray-600 line-clamp-3">{product.description}</p>
                </div>
              ))}
            </div>

            {/* Actions row */}
            <div className="flex min-w-max">
              <div className="w-48 p-4 font-medium text-gray-700">Actions</div>
              {products.map(product => (
                <div key={product.id} className="flex-1 p-4 min-w-[280px] flex space-x-2">
                  <a
                    href={`/product/${product.id}`}
                    className="flex-1 bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-900 text-center"
                  >
                    View Details
                  </a>
                </div>
              ))}
            </div>
          </div>

          {products.length < 4 && (
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">
                Add more products to compare up to 4 products at once
              </p>
              <a
                href="/search"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Browse Products
              </a>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}