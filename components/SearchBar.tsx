'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Product {
  id: number
  name: string
  price: number
  image_url: string
  category_name: string
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (query.trim().length > 2) {
      const fetchResults = async () => {
        setIsLoading(true)
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`)
          const data = await response.json()

          if (data.success) {
            setResults(data.products)
          } else {
            setResults([])
          }
        } catch (error) {
          console.error('Search error:', error)
          setResults([])
        } finally {
          setIsLoading(false)
        }
      }

      const timeoutId = setTimeout(fetchResults, 300) // Debounce search
      return () => clearTimeout(timeoutId)
    } else {
      setResults([])
      setIsLoading(false)
    }
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      setIsOpen(false)
    }
  }

  const handleResultClick = (productId: number) => {
    router.push(`/product/${productId}`)
    setIsOpen(false)
    setQuery('')
  }

  return (
    <div className="relative" ref={searchRef}>
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search products..."
            className="w-full pl-10 pr-10 py-2 bg-secondary-800 border border-secondary-700 rounded-lg text-secondary-100 placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setResults([])
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>

      {isOpen && (query.length > 2 || results.length > 0) && (
        <div className="absolute z-10 w-full mt-1 bg-secondary-900 border border-secondary-800 rounded-lg shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="px-4 py-3 text-center text-secondary-600">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              {results.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleResultClick(product.id)}
                  className="flex items-center p-3 hover:bg-secondary-800 cursor-pointer border-b border-secondary-800 last:border-b-0"
                >
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded mr-3"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-secondary-100 truncate">{product.name}</div>
                    <div className="text-sm text-secondary-500 truncate">
                      {product.category_name} • ${product.price.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
              <div className="p-2 bg-gray-50 text-center">
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  className="text-sm text-primary-500 hover:text-primary-400"
                  onClick={() => setIsOpen(false)}
                >
                  View all {results.length} results for "{query}"
                </Link>
              </div>
            </div>
          ) : query.length > 2 ? (
            <div className="px-4 py-3 text-center text-secondary-600">
              No products found for "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}