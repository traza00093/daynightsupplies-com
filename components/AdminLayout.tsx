'use client'

import { Package, ShoppingBag, Users, BarChart3, Settings, Mail, Percent, Activity, MailOpen, Star, Truck, Calculator, Database, Bell, Upload, Globe, Shield, Key, Languages, FileText, Monitor } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useStoreSettings } from '@/contexts/StoreSettingsContext'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: BarChart3 },
  { name: 'Analytics', href: '/admin/analytics', icon: Activity },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'User Stats', href: '/admin/users/stats', icon: Activity },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Categories', href: '/admin/categories', icon: ShoppingBag },
  { name: 'Orders', href: '/admin/orders', icon: Users },
  { name: 'Reviews', href: '/admin/reviews', icon: Star },
  { name: 'Shipping', href: '/admin/shipping', icon: Truck },
  { name: 'Subscriptions', href: '/admin/subscriptions', icon: Activity },
  { name: 'Contact Messages', href: '/admin/contacts', icon: Mail },
  { name: 'Coupons', href: '/admin/coupons', icon: Percent },
  { name: 'Inventory Alerts', href: '/admin/inventory-alerts', icon: Bell },
  { name: 'Bulk Operations', href: '/admin/bulk-operations', icon: Upload },
  { name: 'SEO Management', href: '/admin/seo', icon: Globe },
  { name: 'Security Logs', href: '/admin/security', icon: Shield },
  { name: 'System Health', href: '/admin/system-health', icon: Monitor },
  { name: 'Tax Management', href: '/admin/taxes', icon: Calculator },
  { name: 'Backup & Restore', href: '/admin/backup', icon: Database },
  { name: 'Account Settings', href: '/admin/settings/account', icon: Settings },
  { name: 'Email Settings', href: '/admin/settings/email', icon: MailOpen },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { storeName } = useStoreSettings()

  return (
    <div className="min-h-screen bg-secondary-950 text-secondary-100">
      <div className="flex">
        <div className="w-64 bg-secondary-900 shadow-lg">
          <div className="p-6 border-b border-secondary-800">
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          </div>
          <nav className="mt-6">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-6 py-3 text-sm font-medium ${
                    isActive
                      ? 'bg-primary-500 text-white'
                      : 'text-secondary-300 hover:text-white hover:bg-secondary-800'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <span className="text-left">{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex-1 bg-secondary-950">
          <header className="bg-secondary-900 shadow-md border-b border-secondary-800">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  {storeName} - Admin Dashboard
                </h2>
                <Link
                  href="/"
                  className="text-sm text-primary-400 hover:text-primary-300"
                >
                  View Store →
                </Link>
              </div>
            </div>
          </header>

          <main className="p-6 bg-secondary-950 text-secondary-100">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}