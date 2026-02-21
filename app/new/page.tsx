'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Star, ShoppingCart, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  created_at: string;
}

export default function NewArrivalsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewProducts = async () => {
      try {
        // Fetch the latest products from the API, sorted by creation date
        const response = await fetch('/api/products?limit=6&sort=newest');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setProducts(data.products);
          }
        }
      } catch (error) {
        console.error('Error fetching new arrivals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewProducts();
  }, []);

  // Loading state
  if (loading) {
    return (
      <main>
        <Header />

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex justify-center mb-4">
                <Sparkles className="h-12 w-12 text-purple-500" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">New Arrivals</h1>
              <p className="text-xl text-gray-600 mb-8">
                Fresh products added weekly - be the first to discover something amazing
              </p>
            </div>
          </div>
        </div>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow group">
                  <div className="relative overflow-hidden rounded-t-lg bg-gray-200 animate-pulse">
                    <div className="w-full h-64"></div>
                  </div>

                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    );
  }

  return (
    <main className="bg-secondary-950 min-h-screen">
      <Header />

      <div className="bg-secondary-950 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Sparkles className="h-12 w-12 text-primary-400" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">New Arrivals</h1>
            <p className="text-xl text-secondary-300 mb-8">
              Fresh products added weekly - be the first to discover something amazing
            </p>
            <div className="inline-flex items-center bg-secondary-900 border border-secondary-800 text-secondary-200 px-4 py-2 rounded-full text-sm font-medium">
              🎉 New products every Tuesday & Friday
            </div>
          </div>
        </div>
      </div>

      <section className="py-16 bg-secondary-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-secondary-900 rounded-lg shadow-sm hover:shadow-md transition-shadow group border border-secondary-800">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-primary-500/90 text-white px-2 py-1 text-xs font-medium rounded shadow-sm">
                    New
                  </span>
                </div>

                <div className="p-2 sm:p-6 text-white">
                  <a href={`/product/${product.id}`} className="font-semibold text-white mb-2 hover:text-primary-400 block text-xs sm:text-lg line-clamp-2">
                    {product.name}
                  </a>
                  <div className="flex items-center mb-2 sm:mb-4">
                    <span className="text-sm sm:text-lg font-bold text-white">${product.price}</span>
                  </div>
                  <a
                    href={`/product/${product.id}`}
                    className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 px-2 sm:px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1 sm:space-x-2 shadow-lg shadow-primary-500/20 text-xs sm:text-base"
                  >
                    <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>View Product</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="bg-secondary-900 py-16 border-t border-secondary-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-8">Stay Updated on New Arrivals</h2>
          <div className="bg-secondary-950 rounded-lg p-8 shadow-sm border border-secondary-800">
            <p className="text-secondary-300 mb-6">
              Subscribe to our newsletter and be the first to know about new products, exclusive previews, and early access deals.
            </p>
            <div className="flex max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-secondary-900 border border-secondary-700 rounded-l-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-secondary-500"
              />
              <button className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-r-lg font-medium transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}