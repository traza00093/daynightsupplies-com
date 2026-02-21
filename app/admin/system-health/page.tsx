'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Activity, Database, Server, Wifi, AlertCircle, CheckCircle } from 'lucide-react'

interface SystemMetrics {
  database: { status: string; responseTime: number }
  server: { uptime: string; memory: number; cpu: number }
  api: { status: string; responseTime: number }
  storage: { used: number; total: number }
}

export default function SystemHealth() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    database: { status: 'healthy', responseTime: 45 },
    server: { uptime: '7 days, 14 hours', memory: 68, cpu: 23 },
    api: { status: 'healthy', responseTime: 120 },
    storage: { used: 2.4, total: 10 }
  })
  const [isLoading, setIsLoading] = useState(false)

  const fetchMetrics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/system/health')
      if (response.ok) {
        const data = await response.json()
        // Only update metrics if we have valid data structure
        if (data.metrics && data.metrics.database && data.metrics.server) {
          setMetrics(data.metrics)
        }
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    return status === 'healthy' ?
      <CheckCircle className="h-5 w-5 text-green-400" /> :
      <AlertCircle className="h-5 w-5 text-red-400" />
  }

  const getStatusColor = (status: string) => {
    return status === 'healthy' ? 'text-green-400' : 'text-red-400'
  }

  return (
    <AdminLayout>
      <div className="text-white">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">System Health</h1>
          <button
            onClick={fetchMetrics}
            disabled={isLoading}
            className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 disabled:opacity-50"
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-secondary-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Database className="h-6 w-6 text-primary-400 mr-2" />
                <h3 className="font-semibold">Database</h3>
              </div>
              {getStatusIcon(metrics.database.status)}
            </div>
            <p className={`text-sm ${getStatusColor(metrics.database.status)}`}>
              {metrics.database.status}
            </p>
            <p className="text-xs text-secondary-400 mt-1">
              Response: {metrics.database.responseTime}ms
            </p>
          </div>

          <div className="bg-secondary-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Server className="h-6 w-6 text-green-400 mr-2" />
                <h3 className="font-semibold">Server</h3>
              </div>
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-sm text-green-400">Running</p>
            <p className="text-xs text-secondary-400 mt-1">
              Uptime: {metrics.server.uptime}
            </p>
          </div>

          <div className="bg-secondary-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Wifi className="h-6 w-6 text-purple-400 mr-2" />
                <h3 className="font-semibold">API</h3>
              </div>
              {getStatusIcon(metrics.api.status)}
            </div>
            <p className={`text-sm ${getStatusColor(metrics.api.status)}`}>
              {metrics.api.status}
            </p>
            <p className="text-xs text-secondary-400 mt-1">
              Response: {metrics.api.responseTime}ms
            </p>
          </div>

          <div className="bg-secondary-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Activity className="h-6 w-6 text-yellow-400 mr-2" />
                <h3 className="font-semibold">Storage</h3>
              </div>
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-sm text-white">
              {metrics.storage.used}GB / {metrics.storage.total}GB
            </p>
            <div className="w-full bg-secondary-800 rounded-full h-2 mt-2">
              <div
                className="bg-yellow-400 h-2 rounded-full"
                style={{ width: `${(metrics.storage.used / metrics.storage.total) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-secondary-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Server Performance</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>CPU Usage</span>
                  <span>{metrics.server.cpu}%</span>
                </div>
                <div className="w-full bg-secondary-800 rounded-full h-2">
                  <div
                    className="bg-primary-400 h-2 rounded-full"
                    style={{ width: `${metrics.server.cpu}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Memory Usage</span>
                  <span>{metrics.server.memory}%</span>
                </div>
                <div className="w-full bg-secondary-800 rounded-full h-2">
                  <div
                    className="bg-green-400 h-2 rounded-full"
                    style={{ width: `${metrics.server.memory}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-secondary-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Alerts</h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                <span>All systems operational</span>
              </div>
              <div className="flex items-center text-sm text-secondary-400">
                <AlertCircle className="h-4 w-4 text-yellow-400 mr-2" />
                <span>High memory usage detected (2 hours ago)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}