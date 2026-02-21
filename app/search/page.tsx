'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import { Search, Filter, SlidersHorizontal } from 'lucide-react'

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
}

interface Category {
  id: number
  name: string
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    query: searchParams.get('q') || '',
    category: searchParams.get('category') || 'all',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating') || '',
    tags: searchParams.get('tags') || '',
    inStock: searchParams.get('inStock') === 'true',
    sortBy: searchParams.get('sortBy') || 'name',
    sortOrder: searchParams.get('sortOrder') || 'asc'
  })
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false
  })

  useEffect(() => {
    fetchCategories()
    performSearch()
  }, [])

  useEffect(() => {
    performSearch()
  }, [filters])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const performSearch = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()

      if (filters.query) params.append('q', filters.query)
      if (filters.category !== 'all') params.append('category', filters.category)
      if (filters.minPrice) params.append('minPrice', filters.minPrice)
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)
      if (filters.minRating) params.append('minRating', filters.minRating)
      if (filters.tags) params.append('tags', filters.tags)
      if (filters.inStock) params.append('inStock', 'true')
      params.append('sortBy', filters.sortBy)
      params.append('sortOrder', filters.sortOrder)
      params.append('limit', pagination.limit.toString())
      params.append('offset', pagination.offset.toString())

      const response = await fetch(`/api/search?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setProducts(data.products)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setPagination(prev => ({ ...prev, offset: 0 }))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch()
  }

  const clearFilters = () => {
    setFilters({
      query: '',
      category: 'all',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      tags: '',
      inStock: false,
      sortBy: 'name',
      sortOrder: 'asc'
    })
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-secondary-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-secondary-50 mb-4">
              {filters.query ? `Search results for "${filters.query}"` : 'All Products'}
            </h1>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={filters.query}
                  onChange={(e) => handleFilterChange('query', e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-secondary-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-secondary-400" />
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-secondary-700 rounded-lg hover:bg-secondary-950 flex items-center space-x-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
              </button>
            </form>

            {/* Filters Panel */}
            {showFilters && (
              <div className="bg-secondary-900 border border-secondary-800 rounded-lg shadow p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-2">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-secondary-700 rounded-md focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-2">Min Price</label>
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      placeholder="$0"
                      className="w-full px-3 py-2 border border-secondary-700 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-2">Max Price</label>
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      placeholder="$999"
                      className="w-full px-3 py-2 border border-secondary-700 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-2">Min Rating</label>
                    <select
                      value={filters.minRating}
                      onChange={(e) => handleFilterChange('minRating', e.target.value)}
                      className="w-full px-3 py-2 border border-secondary-700 rounded-md focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Any Rating</option>
                      <option value="1">1+ Stars</option>
                      <option value="2">2+ Stars</option>
                      <option value="3">3+ Stars</option>
                      <option value="4">4+ Stars</option>
                      <option value="5">5 Stars</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-2">Tags</label>
                    <input
                      type="text"
                      value={filters.tags}
                      onChange={(e) => handleFilterChange('tags', e.target.value)}
                      placeholder="e.g., eco, premium, organic"
                      className="w-full px-3 py-2 border border-secondary-700 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-secondary-500 mt-1">Comma-separated tags</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-2">Sort By</label>
                    <select
                      value={`${filters.sortBy}-${filters.sortOrder}`}
                      onChange={(e) => {
                        const [sortBy, sortOrder] = e.target.value.split('-')
                        handleFilterChange('sortBy', sortBy)
                        handleFilterChange('sortOrder', sortOrder)
                      }}
                      className="w-full px-3 py-2 border border-secondary-700 rounded-md focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="name-asc">Name A-Z</option>
                      <option value="name-desc">Name Z-A</option>
                      <option value="price-asc">Price Low-High</option>
                      <option value="price-desc">Price High-Low</option>
                      <option value="rating-desc">Highest Rated</option>
                      <option value="created_at-desc">Newest First</option>
                      <option value="reviews_count-desc">Most Reviews</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.inStock}
                      onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                      className="rounded border-secondary-700 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-secondary-300">In stock only</span>
                  </label>

                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary-500 hover:text-primary-400"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}

            {/* Results Count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-secondary-400">
                {isLoading ? 'Searching...' : `${pagination.total} products found`}
              </p>
            </div>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 bg-secondary-900 border-b-2 border-primary-500"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-secondary-50 mb-2">No products found</h3>
              <p className="text-secondary-400">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Load More */}
          {pagination.hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={() => {
                  setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))
                  performSearch()
                }}
                className="bg-primary-500 text-secondary-950 font-bold uppercase tracking-wider px-6 py-2 rounded-md hover:bg-primary-400"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}