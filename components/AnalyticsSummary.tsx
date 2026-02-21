'use client'

import { useState, useEffect } from 'react'

interface SummaryData {
  totalRevenue: number
  totalOrders: number
  uniqueCustomers: number
  avgOrderValue: number
}

interface TopItem {
  name: string
  image_url?: string
  total_sold: number
}

interface AnalyticsSummaryProps {
  initialSummary: SummaryData
  initialTopProducts: TopItem[]
  initialTopCategories: TopItem[]
  initialPeriod: string
}

export default function AnalyticsSummary({ 
  initialSummary, 
  initialTopProducts, 
  initialTopCategories, 
  initialPeriod 
}: AnalyticsSummaryProps) {
  const [summary, setSummary] = useState<SummaryData>(initialSummary)
  const [topProducts, setTopProducts] = useState<TopItem[]>(initialTopProducts)
  const [topCategories, setTopCategories] = useState<TopItem[]>(initialTopCategories)
  const [period, setPeriod] = useState(initialPeriod)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSummaryData()
  }, [period])

  const fetchSummaryData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics/summary?period=${period}`)
      const result = await response.json()
      if (result.success) {
        setSummary(result.summary)
        setTopProducts(result.topProducts)
        setTopCategories(result.topCategories)
      }
    } catch (error) {
      console.error('Error fetching analytics summary:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  const summaryCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(summary.totalRevenue),
      change: '+12.5%',
      icon: '💰',
    },
    {
      title: 'Total Orders',
      value: summary.totalOrders.toLocaleString(),
      change: '+8.3%',
      icon: '📦',
    },
    {
      title: 'Unique Customers',
      value: summary.uniqueCustomers.toLocaleString(),
      change: '+5.2%',
      icon: '👥',
    },
    {
      title: 'Avg. Order Value',
      value: formatCurrency(summary.avgOrderValue),
      change: '+3.1%',
      icon: '📊',
    },
  ]

  return (
    <div className="bg-secondary-900 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Analytics Summary</h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="border border-secondary-700 rounded-md px-3 py-1 bg-secondary-800 text-white"
        >
          <option value="7d" className="bg-secondary-800 text-white">Last 7 Days</option>
          <option value="30d" className="bg-secondary-800 text-white">Last 30 Days</option>
          <option value="90d" className="bg-secondary-800 text-white">Last 90 Days</option>
          <option value="1y" className="bg-secondary-800 text-white">Last Year</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {summaryCards.map((card, index) => (
              <div key={index} className="bg-secondary-800 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="text-2xl mr-3 text-white">{card.icon}</div>
                  <div>
                    <p className="text-sm text-secondary-300">{card.title}</p>
                    <p className="text-xl font-bold text-white">{card.value}</p>
                    <p className="text-xs text-green-400">{card.change}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Products */}
            <div>
              <h3 className="font-medium text-white mb-4">Top Products</h3>
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-secondary-800 rounded text-white">
                    <div className="flex items-center">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded mr-3"
                        />
                      )}
                      <span className="font-medium">{product.name}</span>
                    </div>
                    <span className="text-secondary-400">Sold: {product.total_sold}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Categories */}
            <div>
              <h3 className="font-medium text-white mb-4">Top Categories</h3>
              <div className="space-y-3">
                {topCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-secondary-800 rounded text-white">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-secondary-400">Sold: {category.total_sold}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}