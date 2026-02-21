'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Package, AlertTriangle, TrendingUp, Plus, Minus, Edit } from 'lucide-react'

interface InventoryItem {
  id: number
  name: string
  sku: string
  stock_quantity: number
  price: number
  category_name: string
  total_sold: number
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<number | null>(null)
  const [newQuantity, setNewQuantity] = useState('')

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory')
      const data = await response.json()
      if (data.success) {
        setInventory(data.inventory)
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateStock = async (productId: number, quantity: number, action: string = 'set') => {
    try {
      const response = await fetch('/api/inventory', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          stockQuantity: quantity,
          action
        }),
      })

      if (response.ok) {
        fetchInventory()
        setEditingItem(null)
        setNewQuantity('')
      }
    } catch (error) {
      console.error('Failed to update inventory:', error)
    }
  }

  const handleQuickUpdate = (productId: number, action: 'add' | 'subtract', amount: number = 1) => {
    updateStock(productId, amount, action)
  }

  const handleSetQuantity = (productId: number) => {
    const quantity = parseInt(newQuantity)
    if (!isNaN(quantity) && quantity >= 0) {
      updateStock(productId, quantity, 'set')
    }
  }

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { status: 'Out of Stock', color: 'text-red-600 bg-red-50' }
    if (quantity <= 5) return { status: 'Low Stock', color: 'text-yellow-600 bg-yellow-50' }
    if (quantity <= 20) return { status: 'Medium Stock', color: 'text-primary-500 bg-primary-900/30' }
    return { status: 'In Stock', color: 'text-green-600 bg-green-50' }
  }

  const lowStockItems = inventory.filter(item => item.stock_quantity <= 5)
  const outOfStockItems = inventory.filter(item => item.stock_quantity === 0)
  const totalValue = inventory.reduce((sum, item) => sum + (item.stock_quantity * item.price), 0)

  if (isLoading) {
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
      <div>
        <h1 className="text-2xl font-bold text-white mb-8">Inventory Management</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-secondary-900 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-primary-500 rounded-lg p-3">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-400">Total Products</p>
                <p className="text-2xl font-bold text-white">{inventory.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-secondary-900 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-red-500 rounded-lg p-3">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-400">Low Stock</p>
                <p className="text-2xl font-bold text-white">{lowStockItems.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-secondary-900 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-yellow-500 rounded-lg p-3">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-400">Out of Stock</p>
                <p className="text-2xl font-bold text-white">{outOfStockItems.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-secondary-900 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-500 rounded-lg p-3">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-400">Total Value</p>
                <p className="text-2xl font-bold text-white">${totalValue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-secondary-900 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-secondary-800">
            <h2 className="text-lg font-semibold text-white">Product Inventory</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-800">
              <thead className="bg-secondary-950">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-400 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-400 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-400 uppercase tracking-wider">
                    Total Sold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-secondary-900 divide-y divide-secondary-800">
                {inventory.map((item) => {
                  const stockStatus = getStockStatus(item.stock_quantity)
                  return (
                    <tr key={item.id} className="hover:bg-secondary-950">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{item.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-400">{item.sku}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-400">{item.category_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingItem === item.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={newQuantity}
                              onChange={(e) => setNewQuantity(e.target.value)}
                              className="w-20 px-2 py-1 border border-secondary-700 rounded text-sm"
                              min="0"
                            />
                            <button
                              onClick={() => handleSetQuantity(item.id)}
                              className="text-green-600 hover:text-green-800"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => {
                                setEditingItem(null)
                                setNewQuantity('')
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="text-sm font-medium text-white">{item.stock_quantity}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                          {stockStatus.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">${item.price.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-400">{item.total_sold}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuickUpdate(item.id, 'subtract', 1)}
                            className="text-red-600 hover:text-red-800"
                            disabled={item.stock_quantity === 0}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleQuickUpdate(item.id, 'add', 1)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingItem(item.id)
                              setNewQuantity(item.stock_quantity.toString())
                            }}
                            className="text-primary-500 hover:text-primary-400"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}