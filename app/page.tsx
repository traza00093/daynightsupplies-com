import Header from '@/components/Header'
import HeroBanner from '@/components/HeroBanner'
import FeaturedCategories from '@/components/FeaturedCategories'
import BestSellers from '@/components/BestSellers'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="safe-bottom">
        <HeroBanner />
        <FeaturedCategories />
        <BestSellers />
      </div>
      <Footer />
    </main>
  )
}
