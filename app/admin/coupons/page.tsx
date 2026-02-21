'use client'

import React, { useState, useEffect } from 'react'
import { Trash2, Plus, Calendar, Tag, Percent, DollarSign, Minus, Filter } from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'

interface Coupon {
  id: number
  code: string
  description: string
  discount_type: 'percentage' | 'fixed_amount'
  discount_value: number
  minimum_order_amount: number
  maximum_discount_amount: number | null
  usage_limit: number | null
  usage_count: number
  valid_from: string
  valid_until: string | null
  applies_to_categories: number[]
  applies_to_products: number[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function CouponManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    minimum_order_amount: 0,
    maximum_discount_amount: null as number | null,
    usage_limit: null as number | null,
    valid_from: '',
    valid_until: '',
    applies_to_categories: [] as number[],
    applies_to_products: [] as number[],
    is_active: true
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/coupons')
      const data = await response.json()
      
      if (response.ok) {
        setCoupons(data.coupons || [])
      } else {
        setError(data.error || 'Failed to fetch coupons')
      }
    } catch (err) {
      setError('Error fetching coupons')
      console.error('Error fetching coupons:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const method = editingCoupon ? 'PUT' : 'POST'
      const url = editingCoupon ? `/api/coupons/${editingCoupon.id}` : '/api/coupons'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          maximum_discount_amount: formData.maximum_discount_amount,
          usage_limit: formData.usage_limit,
        }),
      })
      
      const result = await response.json()
      
      if (response.ok) {
        fetchCoupons() // Refresh the list
        setShowForm(false)
        setEditingCoupon(null)
        setFormData({
          code: '',
          description: '',
          discount_type: 'percentage',
          discount_value: 0,
          minimum_order_amount: 0,
          maximum_discount_amount: null,
          usage_limit: null,
          valid_from: '',
          valid_until: '',
          applies_to_categories: [],
          applies_to_products: [],
          is_active: true
        })
      } else {
        setError(result.error || `Failed to ${editingCoupon ? 'update' : 'create'} coupon`)
      }
    } catch (err) {
      setError(`Error ${editingCoupon ? 'updating' : 'creating'} coupon`)
      console.error(`Error ${editingCoupon ? 'updating' : 'creating'} coupon:`, err)
    }
  }

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      minimum_order_amount: coupon.minimum_order_amount,
      maximum_discount_amount: coupon.maximum_discount_amount,
      usage_limit: coupon.usage_limit,
      valid_from: coupon.valid_from,
      valid_until: coupon.valid_until || '',
      applies_to_categories: coupon.applies_to_categories,
      applies_to_products: coupon.applies_to_products,
      is_active: coupon.is_active
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return
    
    try {
      const response = await fetch(`/api/coupons/${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        fetchCoupons() // Refresh the list
      } else {
        const result = await response.json()
        setError(result.error || 'Failed to delete coupon')
      }
    } catch (err) {
      setError('Error deleting coupon')
      console.error('Error deleting coupon:', err)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name.includes('_limit') || name.includes('_amount') || name === 'discount_value' 
        ? value === '' ? null : value 
        : value
    }))
  }

  if (loading) return <div className="p-6 text-center">Loading coupons...</div>
  if (error) return <div className="p-6 text-center text-red-500">Error: {error}</div>

  return (
    <AdminLayout>
    <div className="p-6 max-w-6xl mx-auto text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Coupon Management</h1>
        <button
          onClick={() => {
            setEditingCoupon(null)
            setFormData({
              code: '',
              description: '',
              discount_type: 'percentage',
              discount_value: 0,
              minimum_order_amount: 0,
              maximum_discount_amount: null,
              usage_limit: null,
              valid_from: '',
              valid_until: '',
              applies_to_categories: [],
              applies_to_products: [],
              is_active: true
            })
            setShowForm(true)
          }}
          className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus size={18} />
          Add Coupon
        </button>
      </div>

      {showForm && (
        <div className="mb-6 bg-secondary-900 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-white">
            {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
          </h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-secondary-300">Code *</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-secondary-700 rounded bg-secondary-800 text-white"
                placeholder="e.g., SUMMER20"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-secondary-300">Description</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-2 border border-secondary-700 rounded bg-secondary-800 text-white"
                placeholder="Coupon description"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-secondary-300">Discount Type *</label>
              <select
                name="discount_type"
                value={formData.discount_type}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-secondary-700 rounded bg-secondary-800 text-white"
              >
                <option value="percentage" className="bg-secondary-800 text-white">Percentage</option>
                <option value="fixed_amount" className="bg-secondary-800 text-white">Fixed Amount</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-secondary-300">
                {formData.discount_type === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount ($) *'}
              </label>
              <input
                type="number"
                name="discount_value"
                value={formData.discount_value}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full p-2 border border-secondary-700 rounded bg-secondary-800 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-secondary-300">Minimum Order Amount ($)</label>
              <input
                type="number"
                name="minimum_order_amount"
                value={formData.minimum_order_amount}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full p-2 border border-secondary-700 rounded bg-secondary-800 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-secondary-300">Maximum Discount Amount ($)</label>
              <input
                type="number"
                name="maximum_discount_amount"
                value={formData.maximum_discount_amount || ''}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full p-2 border border-secondary-700 rounded bg-secondary-800 text-white"
              />
              <p className="text-xs text-secondary-400 mt-1">Leave empty for no maximum</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-secondary-300">Usage Limit</label>
              <input
                type="number"
                name="usage_limit"
                value={formData.usage_limit || ''}
                onChange={handleInputChange}
                min="1"
                className="w-full p-2 border border-secondary-700 rounded bg-secondary-800 text-white"
              />
              <p className="text-xs text-secondary-400 mt-1">Leave empty for unlimited</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-secondary-300">Valid From</label>
              <input
                type="datetime-local"
                name="valid_from"
                value={formData.valid_from}
                onChange={handleInputChange}
                className="w-full p-2 border border-secondary-700 rounded bg-secondary-800 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-secondary-300">Valid Until</label>
              <input
                type="datetime-local"
                name="valid_until"
                value={formData.valid_until}
                onChange={handleInputChange}
                className="w-full p-2 border border-secondary-700 rounded bg-secondary-800 text-white"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-secondary-300">Applies to Categories (comma-separated IDs)</label>
              <input
                type="text"
                name="applies_to_categories"
                value={formData.applies_to_categories.join(',')}
                onChange={(e) => setFormData({...formData, applies_to_categories: e.target.value.split(',').map(Number).filter(n => !isNaN(n))})}
                className="w-full p-2 border border-secondary-700 rounded bg-secondary-800 text-white"
                placeholder="e.g., 1,2,3"
              />
              <p className="text-xs text-secondary-400 mt-1">Leave empty to apply to all categories</p>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-secondary-300">Applies to Products (comma-separated IDs)</label>
              <input
                type="text"
                name="applies_to_products"
                value={formData.applies_to_products.join(',')}
                onChange={(e) => setFormData({...formData, applies_to_products: e.target.value.split(',').map(Number).filter(n => !isNaN(n))})}
                className="w-full p-2 border border-secondary-700 rounded bg-secondary-800 text-white"
                placeholder="e.g., 1,2,3"
              />
              <p className="text-xs text-secondary-400 mt-1">Leave empty to apply to all products</p>
            </div>
            
            <div className="md:col-span-2 flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="mr-2 h-4 w-4 text-primary-500 bg-secondary-800 border-secondary-700 rounded"
              />
              <label className="text-sm font-medium text-secondary-300">Active</label>
            </div>
            
            <div className="md:col-span-2 flex gap-2 mt-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
              >
                {editingCoupon ? 'Update' : 'Create'} Coupon
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingCoupon(null)
                }}
                className="bg-secondary-700 text-white px-4 py-2 rounded hover:bg-secondary-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-secondary-900 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-secondary-800">
          <thead className="bg-secondary-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Discount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Validity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Usage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-secondary-900 divide-y divide-secondary-800">
            {(coupons || []).map((coupon) => (
              <tr key={coupon.id} className="hover:bg-secondary-800">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-white">{coupon.code}</div>
                  <div className="text-sm text-secondary-400">{coupon.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {coupon.discount_type === 'percentage' ? (
                      <Percent className="mr-1 h-4 w-4 text-secondary-400" />
                    ) : (
                      <DollarSign className="mr-1 h-4 w-4 text-secondary-400" />
                    )}
                    {coupon.discount_type === 'percentage' 
                      ? `${coupon.discount_value}%` 
                      : `$${coupon.discount_value}`}
                  </div>
                  {coupon.minimum_order_amount > 0 && (
                    <div className="text-sm text-secondary-400">Min: ${coupon.minimum_order_amount}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-secondary-400">
                    <Calendar className="mr-1 h-4 w-4" />
                    <div>
                      <div>{new Date(coupon.valid_from).toLocaleDateString()}</div>
                      <div>
                        {coupon.valid_until 
                          ? `to ${new Date(coupon.valid_until).toLocaleDateString()}` 
                          : 'No end date'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-white">
                    {coupon.usage_limit 
                      ? `${coupon.usage_count}/${coupon.usage_limit}` 
                      : `${coupon.usage_count} used`}
                  </div>
                  {coupon.usage_limit && coupon.usage_count >= coupon.usage_limit && (
                    <div className="text-xs text-red-400">Limit reached</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    coupon.is_active 
                      ? 'bg-green-800 text-green-200' 
                      : 'bg-red-800 text-red-200'
                  }`}>
                    {coupon.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(coupon)}
                    className="text-primary-400 hover:text-primary-300 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(coupon.id)}
                    className="text-red-500 hover:text-red-400 flex items-center"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {coupons.length === 0 && (
          <div className="text-center py-8 text-secondary-400">
            No coupons found. Create your first coupon using the "Add Coupon" button.
          </div>
        )}
      </div>
    </div>
    </AdminLayout>
  )
}