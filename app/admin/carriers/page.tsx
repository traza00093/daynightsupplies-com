'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'

export default function AdminCarriers() {
  const [carriers, setCarriers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCarrier, setEditingCarrier] = useState<{id: number, name: string, service_name: string, base_delivery_days: number} | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    service_name: '',
    base_delivery_days: 3
  })

  useEffect(() => {
    fetchCarriers()
  }, [])

  const fetchCarriers = async () => {
    try {
      const response = await fetch('/api/admin/carriers')
      const data = await response.json()
      const allCarriers = data.carriers || []
      
      // Remove duplicates based on ID to ensure unique carriers only
      const seen = new Set();
      const uniqueCarriers = allCarriers.filter((item: any) => {
        if (seen.has(item.id)) {
          return false;
        }
        seen.add(item.id);
        return true;
      });
      
      setCarriers(uniqueCarriers)
    } catch (error) {
      console.error('Failed to fetch carriers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingCarrier) {
      // Update existing carrier
      const response = await fetch(`/api/admin/carriers/${editingCarrier.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setEditingCarrier(null)
        setShowForm(false)
        setFormData({ name: '', service_name: '', base_delivery_days: 3 })
        fetchCarriers()
      }
    } else {
      // Create new carrier
      const response = await fetch('/api/admin/carriers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setShowForm(false)
        setFormData({ name: '', service_name: '', base_delivery_days: 3 })
        fetchCarriers()
      }
    }
  }

  const handleEdit = (carrier: {id: number, name: string, service_name: string, base_delivery_days: number}) => {
    setEditingCarrier(carrier)
    setFormData({
      name: carrier.name,
      service_name: carrier.service_name,
      base_delivery_days: carrier.base_delivery_days
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this carrier?')) {
      const response = await fetch(`/api/admin/carriers/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchCarriers()
      }
    }
  }

  const resetForm = () => {
    setEditingCarrier(null)
    setFormData({ name: '', service_name: '', base_delivery_days: 3 })
    setShowForm(false)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="text-white">
        <h1 className="text-2xl font-bold text-white mb-6">Shipping Carriers</h1>

        <div className="mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md"
          >
            Add New Carrier
          </button>
        </div>

        {showForm && (
          <div className="bg-secondary-900 rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              {editingCarrier ? 'Edit Carrier' : 'Add New Carrier'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">
                  Carrier Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-secondary-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-secondary-800 text-white"
                  placeholder="e.g., UPS, FedEx, USPS"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">
                  Service Name
                </label>
                <input
                  type="text"
                  value={formData.service_name}
                  onChange={(e) => setFormData({...formData, service_name: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-secondary-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-secondary-800 text-white"
                  placeholder="e.g., UPS Ground, FedEx Express"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">
                  Base Delivery Days
                </label>
                <input
                  type="number"
                  value={formData.base_delivery_days}
                  onChange={(e) => setFormData({...formData, base_delivery_days: parseInt(e.target.value)})}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-secondary-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-secondary-800 text-white"
                  placeholder="e.g., 3"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {editingCarrier ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center px-4 py-2 border border-secondary-700 text-sm font-medium rounded-md shadow-sm text-white bg-secondary-700 hover:bg-secondary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-secondary-900 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-800">
              <thead className="bg-secondary-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Carrier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Service Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Base Delivery Days</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-800">
                {carriers.map((carrier: any) => (
                  <tr key={carrier.id} className="hover:bg-secondary-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{carrier.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-300">{carrier.service_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-300">{carrier.base_delivery_days} days</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(carrier)}
                        className="text-primary-500 hover:text-primary-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(carrier.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}