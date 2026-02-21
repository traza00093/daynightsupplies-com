'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { AlertTriangle, Bell, Package } from 'lucide-react'

interface InventoryAlert {
  id: number
  product_name: string
  sku: string
  current_stock: number
  threshold: number
  status: 'low' | 'out'
}

export default function InventoryAlerts() {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([])
  const [settings, setSettings] = useState({
    lowStockThreshold: 10,
    outOfStockAlert: true,
    emailNotifications: true
  })

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/admin/inventory/alerts')
      if (response.ok) {
        const data = await response.json()
        setAlerts(data.alerts || [])
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
      // Mock data for demo
      setAlerts([
        { id: 1, product_name: 'Premium Coffee Maker', sku: 'PROD-1', current_stock: 5, threshold: 10, status: 'low' },
        { id: 2, product_name: 'Wireless Earbuds', sku: 'PROD-3', current_stock: 0, threshold: 5, status: 'out' }
      ])
    }
  }

  const updateSettings = async () => {
    try {
      await fetch('/api/admin/inventory/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
    } catch (error) {
      console.error('Failed to update settings:', error)
    }
  }

  return (
    <AdminLayout>
      <div className="text-white">
        <h1 className="text-2xl font-bold mb-6">Inventory Alerts</h1>

        {/* Settings */}
        <div className="bg-secondary-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Alert Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Low Stock Threshold</label>
              <input
                type="number"
                value={settings.lowStockThreshold}
                onChange={(e) => setSettings({...settings, lowStockThreshold: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-secondary-700 rounded-md bg-secondary-800 text-white"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.outOfStockAlert}
                onChange={(e) => setSettings({...settings, outOfStockAlert: e.target.checked})}
                className="h-4 w-4 text-primary-500 rounded mr-2"
              />
              <label>Out of Stock Alerts</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                className="h-4 w-4 text-primary-500 rounded mr-2"
              />
              <label>Email Notifications</label>
            </div>
          </div>
          <button
            onClick={updateSettings}
            className="mt-4 bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600"
          >
            Save Settings
          </button>
        </div>

        {/* Alerts */}
        <div className="bg-secondary-900 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-secondary-800">
            <h2 className="text-lg font-semibold flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Active Alerts ({alerts.length})
            </h2>
          </div>
          <div className="divide-y divide-secondary-800">
            {alerts.map((alert) => (
              <div key={alert.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-2 rounded-full mr-4 ${
                    alert.status === 'out' ? 'bg-red-800' : 'bg-yellow-800'
                  }`}>
                    {alert.status === 'out' ? 
                      <AlertTriangle className="h-5 w-5 text-red-200" /> :
                      <Package className="h-5 w-5 text-yellow-200" />
                    }
                  </div>
                  <div>
                    <h3 className="font-medium">{alert.product_name}</h3>
                    <p className="text-sm text-secondary-400">SKU: {alert.sku}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    alert.status === 'out' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {alert.current_stock} units
                  </p>
                  <p className="text-sm text-secondary-400">
                    Threshold: {alert.threshold}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}