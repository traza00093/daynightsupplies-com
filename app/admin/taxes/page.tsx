'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Plus, Edit, Trash2 } from 'lucide-react'

interface TaxRate {
  id: number
  name: string
  rate: number
  country: string
  state?: string
  is_active: boolean
}

export default function AdminTaxes() {
  const [taxRates, setTaxRates] = useState<TaxRate[]>([
    { id: 1, name: 'NY Sales Tax', rate: 8.25, country: 'US', state: 'NY', is_active: true },
    { id: 2, name: 'CA Sales Tax', rate: 7.25, country: 'US', state: 'CA', is_active: true }
  ])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTax, setEditingTax] = useState<TaxRate | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    rate: '',
    country: 'US',
    state: '',
    is_active: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const newTax = {
      id: editingTax?.id || Date.now(),
      name: formData.name,
      rate: parseFloat(formData.rate),
      country: formData.country,
      state: formData.state || undefined,
      is_active: formData.is_active
    }
    
    if (editingTax) {
      setTaxRates(prev => prev.map(tax => tax.id === editingTax.id ? newTax : tax))
    } else {
      setTaxRates(prev => [...prev, newTax])
    }
    
    setIsModalOpen(false)
    resetForm()
  }

  const handleEdit = (tax: TaxRate) => {
    setEditingTax(tax)
    setFormData({
      name: tax.name,
      rate: tax.rate.toString(),
      country: tax.country,
      state: tax.state || '',
      is_active: tax.is_active
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this tax rate?')) {
      setTaxRates(prev => prev.filter(tax => tax.id !== id))
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      rate: '',
      country: 'US',
      state: '',
      is_active: true
    })
    setEditingTax(null)
  }

  return (
    <AdminLayout>
      <div className="text-white">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Tax Management</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Tax Rate
          </button>
        </div>

        <div className="bg-secondary-900 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-secondary-800">
            <thead className="bg-secondary-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-secondary-900 divide-y divide-secondary-800">
              {taxRates.map((tax) => (
                <tr key={tax.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{tax.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{tax.rate}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {tax.country}{tax.state && `, ${tax.state}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      tax.is_active ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'
                    }`}>
                      {tax.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(tax)}
                      className="text-primary-400 hover:text-primary-300 mr-3"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tax.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-secondary-900 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{editingTax ? 'Edit' : 'Add'} Tax Rate</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-secondary-700 rounded-md bg-secondary-800 text-white"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.rate}
                    onChange={(e) => setFormData({...formData, rate: e.target.value})}
                    className="w-full px-3 py-2 border border-secondary-700 rounded-md bg-secondary-800 text-white"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="w-full px-3 py-2 border border-secondary-700 rounded-md bg-secondary-800 text-white"
                  />
                </div>
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="h-4 w-4 text-primary-500 rounded"
                  />
                  <label className="ml-2 text-sm">Active</label>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {setIsModalOpen(false); resetForm()}}
                    className="px-4 py-2 text-secondary-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
                  >
                    {editingTax ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}