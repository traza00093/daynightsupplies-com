'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Package, ShoppingBag, Users, DollarSign } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    orders: 0,
    revenue: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [productsRes, categoriesRes, ordersRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/categories'),
        fetch('/api/admin/orders')
      ])

      const [products, categories, orders] = await Promise.all([
        productsRes.json(),
        categoriesRes.json(),
        ordersRes.json()
      ])

      const revenue = orders.orders?.reduce((sum: number, order: any) => sum + parseFloat(order.total_amount || 0), 0) || 0

      setStats({
        products: products.products?.length || 0,
        categories: categories.categories?.length || 0,
        orders: orders.orders?.length || 0,
        revenue
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const statCards = [
    { name: 'Total Products', value: stats.products, icon: Package, color: 'bg-primary-500' },
    { name: 'Categories', value: stats.categories, icon: ShoppingBag, color: 'bg-green-500' },
    { name: 'Total Orders', value: stats.orders, icon: Users, color: 'bg-purple-500' },
    { name: 'Revenue', value: `$${(stats.revenue || 0).toFixed(2)}`, icon: DollarSign, color: 'bg-yellow-500' },
  ]

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold text-white mb-8">Dashboard Overview</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.name} className="bg-secondary-900 rounded-xl shadow-lg p-6 border border-secondary-800 hover:border-secondary-700 transition-colors">
                <div className="flex items-center">
                  <div className={`${stat.color} rounded-xl p-3 shadow-lg`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-secondary-400 uppercase tracking-wide">{stat.name}</p>
                    <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="bg-secondary-900 rounded-xl shadow-lg p-8 border border-secondary-800">
          <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <a
              href="/admin/products"
              className="group p-6 border border-secondary-700 rounded-xl hover:bg-secondary-800 hover:border-secondary-600 transition-all duration-200 bg-secondary-800"
            >
              <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors">Manage Products</h3>
              <p className="text-sm text-secondary-400 mt-2">Add, edit, or remove products</p>
            </a>
            <a
              href="/admin/categories"
              className="group p-6 border border-secondary-700 rounded-xl hover:bg-secondary-800 hover:border-secondary-600 transition-all duration-200 bg-secondary-800"
            >
              <h3 className="font-semibold text-white group-hover:text-green-400 transition-colors">Manage Categories</h3>
              <p className="text-sm text-secondary-400 mt-2">Organize your product categories</p>
            </a>
            <a
              href="/admin/orders"
              className="group p-6 border border-secondary-700 rounded-xl hover:bg-secondary-800 hover:border-secondary-600 transition-all duration-200 bg-secondary-800"
            >
              <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors">View Orders</h3>
              <p className="text-sm text-secondary-400 mt-2">Process and manage orders</p>
            </a>
            <a
              href="/admin/contacts"
              className="group p-6 border border-secondary-700 rounded-xl hover:bg-secondary-800 hover:border-secondary-600 transition-all duration-200 bg-secondary-800"
            >
              <h3 className="font-semibold text-white group-hover:text-yellow-400 transition-colors">Contact Messages</h3>
              <p className="text-sm text-secondary-400 mt-2">View and manage customer messages</p>
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}