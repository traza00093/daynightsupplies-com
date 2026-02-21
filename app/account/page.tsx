'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { User, ShoppingBag, Heart, Settings, Package } from 'lucide-react'

export default function AccountPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
        <Footer />
      </>
    )
  }

  if (!session) {
    return null
  }

  const menuItems = [
    {
      title: 'Profile Settings',
      description: 'Manage your personal information and preferences',
      icon: User,
      href: '/account/profile',
      color: 'bg-blue-500'
    },
    {
      title: 'Order History',
      description: 'View your past orders and track current ones',
      icon: Package,
      href: '/account/orders',
      color: 'bg-green-500'
    },
    {
      title: 'Wishlist',
      description: 'Items you want to purchase later',
      icon: Heart,
      href: '/account/wishlist',
      color: 'bg-red-500'
    }
  ]

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-800 rounded-lg shadow p-6 mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              Welcome back, {session.user?.name}!
            </h1>
            <p className="text-gray-400">
              Manage your account settings and view your activity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.title}
                  href={item.href}
                  className="bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow p-6 block"
                >
                  <div className="flex items-center mb-4">
                    <div className={`${item.color} rounded-lg p-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="ml-4 text-lg font-semibold text-white">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {item.description}
                  </p>
                </a>
              )
            })}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}