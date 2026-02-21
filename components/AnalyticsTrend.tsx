'use client'

import { useState, useEffect } from 'react'

interface AnalyticsData {
  date: string
  total: number
}

interface AnalyticsTrendProps {
  initialData: AnalyticsData[]
  initialMetric: string
}

export default function AnalyticsTrend({ initialData, initialMetric }: AnalyticsTrendProps) {
  const [data, setData] = useState<AnalyticsData[]>(initialData)
  const [metric, setMetric] = useState(initialMetric)
  const [period, setPeriod] = useState('30d')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchAnalyticsData()
  }, [metric, period])

  const fetchAnalyticsData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics/trend?metric=${metric}&period=${period}`)
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Prepare data for chart
  // Prepare data for chart
  const maxVal = data.length > 0 ? (Math.max(...data.map(d => d.total || 0)) || 1) : 1
  const chartHeight = 200

  // Calculate chart points
  const chartPoints = data.map((d, i) => {
    let x = 50
    if (data.length > 1) {
      x = (i / (data.length - 1)) * 100
    }
    const val = d.total || 0
    const y = chartHeight - (val / maxVal) * chartHeight
    return { x, y, date: d.date, total: val }
  }).filter(p => !isNaN(p.x) && !isNaN(p.y))

  return (
    <div className="bg-secondary-900 p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Analytics Trend</h2>
        <div className="flex space-x-4">
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            className="border border-secondary-700 rounded-md px-3 py-1 bg-secondary-800 text-white"
          >
            <option value="revenue" className="bg-secondary-800 text-white">Revenue</option>
            <option value="orders" className="bg-secondary-800 text-white">Orders</option>
            <option value="customers" className="bg-secondary-800 text-white">Customers</option>
            <option value="products" className="bg-secondary-800 text-white">Products Sold</option>
          </select>
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
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-secondary-400">
          No data available for the selected period
        </div>
      ) : (
        <div className="relative h-64 border-b border-l border-secondary-800">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-secondary-400 py-2">
            <span>${maxVal.toFixed(2)}</span>
            <span>${(maxVal * 0.75).toFixed(2)}</span>
            <span>${(maxVal * 0.5).toFixed(2)}</span>
            <span>${(maxVal * 0.25).toFixed(2)}</span>
            <span>0</span>
          </div>

          {/* Chart area */}
          <div className="absolute left-8 right-0 top-0 bottom-0">
            {/* Grid lines */}
            <div className="w-full h-1/4 border-t border-secondary-800"></div>
            <div className="w-full h-1/4 border-t border-secondary-800"></div>
            <div className="w-full h-1/4 border-t border-secondary-800"></div>
            <div className="w-full h-1/4 border-t border-secondary-800"></div>

            {/* Chart line */}
            <svg
              className="w-full h-full"
              viewBox={`0 0 100 ${chartHeight}`}
              preserveAspectRatio="none"
            >
              <polyline
                fill="none"
                stroke={metric === 'revenue' ? '#818cf8' :
                  metric === 'orders' ? '#34d399' :
                    metric === 'customers' ? '#f87171' : '#fbbf24'}
                strokeWidth="2"
                points={chartPoints.map(p => `${p.x},${p.y}`).join(' ')}
              />

              {/* Data points */}
              {chartPoints.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r="3"
                  fill={metric === 'revenue' ? '#818cf8' :
                    metric === 'orders' ? '#34d399' :
                      metric === 'customers' ? '#f87171' : '#fbbf24'}
                />
              ))}
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}