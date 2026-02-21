'use client'

import { useState, useEffect } from 'react'
import { BarChart3, DollarSign, ShoppingCart, Users, Package } from 'lucide-react'
import Header from '@/components/Header'
import AdminLayout from '@/components/AdminLayout'
import AnalyticsTrend from '@/components/AnalyticsTrend'
import AnalyticsSummary from '@/components/AnalyticsSummary'

interface AnalyticsData {
  date: string
  total: number
}

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

export default function AnalyticsPage() {
  const [initialTrendData, setInitialTrendData] = useState<AnalyticsData[]>([])
  const [initialSummary, setInitialSummary] = useState<SummaryData>({
    totalRevenue: 0,
    totalOrders: 0,
    uniqueCustomers: 0,
    avgOrderValue: 0
  })
  const [initialTopProducts, setInitialTopProducts] = useState<TopItem[]>([])
  const [initialTopCategories, setInitialTopCategories] = useState<TopItem[]>([])
  const [initialPeriod, setInitialPeriod] = useState('30d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const [trendRes, summaryRes] = await Promise.all([
        fetch('/api/analytics/trend?metric=revenue&period=30d'),
        fetch('/api/analytics/summary?period=30d')
      ])

      const [trendData, summaryData] = await Promise.all([
        trendRes.json(),
        summaryRes.json()
      ])

      if (trendData.success) {
        setInitialTrendData(trendData.data)
      }
      if (summaryData.success) {
        setInitialSummary(summaryData.summary)
        setInitialTopProducts(summaryData.topProducts)
        setInitialTopCategories(summaryData.topCategories)
        setInitialPeriod(summaryData.period)
      }
    } catch (error) {
      console.error('Error fetching initial analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 text-white">
        <div className="flex items-center mb-6">
          <BarChart3 className="h-8 w-8 text-white mr-3" />
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
        </div>

        <AnalyticsSummary 
          initialSummary={initialSummary}
          initialTopProducts={initialTopProducts}
          initialTopCategories={initialTopCategories}
          initialPeriod={initialPeriod}
        />

        <div className="mt-8">
          <AnalyticsTrend 
            initialData={initialTrendData}
            initialMetric="revenue"
          />
        </div>
      </div>
    </AdminLayout>
  )
}