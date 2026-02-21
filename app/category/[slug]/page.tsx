'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useEffect, useState } from 'react'

interface Product {
  id: number
  name: string
  price: number
  image_url: string
  rating?: number
  reviews_count?: number
}

interface Category {
  id: number
  name: string
  slug: string
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const catRes = await fetch(`/api/categories?slug=${encodeURIComponent(slug)}`)
        if (!catRes.ok) throw new Error('Failed to load category')
        const catData = await catRes.json()
        const cat = (catData.categories || []).find((c: Category) => c.slug === slug) || catData.categories?.[0]
        if (!cat) throw new Error('Category not found')
        setCategory(cat)

        const prodRes = await fetch(`/api/products?categoryId=${cat.id}&limit=24`)
        if (!prodRes.ok) throw new Error('Failed to load products')
        const prodData = await prodRes.json()
        setProducts(prodData.products || [])
      } catch (e: any) {
        setError(e.message || 'Failed to load category')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  if (loading) {
    return (
      <main>
        <Header />
        <div className="py-16"><div className="max-w-7xl mx-auto px-4"><h1 className="text-3xl font-bold text-secondary-50">Loading...</h1></div></div>
        <Footer />
      </main>
    )
  }

  if (error) {
    return (
      <main>
        <Header />
        <div className="py-16"><div className="max-w-7xl mx-auto px-4"><h1 className="text-2xl font-bold text-red-500">{error}</h1></div></div>
        <Footer />
      </main>
    )
  }

  return (
    <main>
      <Header />
      <section className="py-10 bg-secondary-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-secondary-50 mb-6">{category?.name}</h1>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {products.map((p) => (
              <a key={p.id} href={`/product/${p.id}`} className="bg-secondary-900 rounded-lg shadow-sm hover:shadow-md transition-shadow group border border-secondary-800">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img src={p.image_url} alt={p.name} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-2 sm:p-4">
                  <h3 className="font-medium text-xs sm:text-base text-secondary-50 mb-2 line-clamp-2 hover:text-secondary-300">{p.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm sm:text-lg font-bold text-secondary-50">${p.price}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}