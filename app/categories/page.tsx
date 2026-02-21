import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FeaturedCategories from '@/components/FeaturedCategories'

export default function CategoriesPage() {
  return (
    <main>
      <Header />

      <div className="bg-secondary-950 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Shop by Category</h1>
            <p className="text-xl text-secondary-300">Find exactly what you need in our organized categories</p>
          </div>
        </div>
      </div>

      <FeaturedCategories />

      <div className="py-16 bg-secondary-900 border-t border-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Quality Products</h3>
              <p className="text-secondary-400">Carefully curated items for your daily needs</p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Easy Navigation</h3>
              <p className="text-secondary-400">Find products quickly with our organized categories</p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Regular Updates</h3>
              <p className="text-secondary-400">New products added weekly to each category</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}