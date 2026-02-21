'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Header from '@/components/Header'
import AdminLayout from '@/components/AdminLayout'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'

interface SubscriptionPlan {
  id: number
  name: string
  description: string
  price: number
  interval_type: string
  interval_count: number
  trial_period_days: number
  features: any
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function SubscriptionManagement() {
  const { data: session } = useSession()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    interval_type: 'month',
    interval_count: 1,
    trial_period_days: 0,
    features: [] as string[],
    is_active: true
  })

  useEffect(() => {
    fetchSubscriptionPlans()
  }, [])

  const fetchSubscriptionPlans = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/subscriptions/plans')
      const data = await response.json()
      if (data.success) {
        setPlans(data.plans)
      }
    } catch (error) {
      console.error('Error fetching subscription plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/subscriptions/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          features: JSON.stringify(formData.features)
        }),
      })

      const result = await response.json()
      if (result.success) {
        fetchSubscriptionPlans()
        resetForm()
      } else {
        alert(result.error || 'Failed to create subscription plan')
      }
    } catch (error) {
      alert('Failed to create subscription plan')
    }
  }

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingPlan) return
    
    try {
      const response = await fetch(`/api/subscriptions/plans/${editingPlan.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          features: JSON.stringify(formData.features)
        }),
      })

      const result = await response.json()
      if (result.success) {
        fetchSubscriptionPlans()
        resetForm()
      } else {
        alert(result.error || 'Failed to update subscription plan')
      }
    } catch (error) {
      alert('Failed to update subscription plan')
    }
  }

  const handleDeletePlan = async (id: number) => {
    if (!confirm('Are you sure you want to delete this subscription plan?')) return
    
    try {
      const response = await fetch(`/api/subscriptions/plans/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()
      if (result.success) {
        fetchSubscriptionPlans()
      } else {
        alert(result.error || 'Failed to delete subscription plan')
      }
    } catch (error) {
      alert('Failed to delete subscription plan')
    }
  }

  const startEditing = (plan: SubscriptionPlan) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      interval_type: plan.interval_type,
      interval_count: plan.interval_count,
      trial_period_days: plan.trial_period_days,
      features: Array.isArray(plan.features) ? plan.features : plan.features ? plan.features.split(',') : [],
      is_active: plan.is_active
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setEditingPlan(null)
    setShowForm(false)
    setFormData({
      name: '',
      description: '',
      price: 0,
      interval_type: 'month',
      interval_count: 1,
      trial_period_days: 0,
      features: [],
      is_active: true
    })
  }

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, '']
    })
  }

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features]
    newFeatures[index] = value
    setFormData({
      ...formData,
      features: newFeatures
    })
  }

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      features: newFeatures
    })
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Subscription Management</h1>
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="flex items-center bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Plan
          </button>
        </div>

        {showForm && (
          <div className="bg-secondary-900 p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4 text-white">
              {editingPlan ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
            </h2>
            
            <form onSubmit={editingPlan ? handleUpdatePlan : handleCreatePlan} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-secondary-700 rounded-md bg-secondary-800 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-1">Price *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-secondary-700 rounded-md bg-secondary-800 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-1">Billing Interval</label>
                  <div className="flex space-x-4">
                    <select
                      value={formData.interval_count}
                      onChange={(e) => setFormData({...formData, interval_count: parseInt(e.target.value)})}
                      className="flex-1 px-3 py-2 border border-secondary-700 rounded-md bg-secondary-800 text-white"
                    >
                      {[1, 2, 3, 6, 12].map(num => (
                        <option key={num} value={num} className="bg-secondary-800 text-white">{num}</option>
                      ))}
                    </select>
                    
                    <select
                      value={formData.interval_type}
                      onChange={(e) => setFormData({...formData, interval_type: e.target.value})}
                      className="flex-1 px-3 py-2 border border-secondary-700 rounded-md bg-secondary-800 text-white"
                    >
                      <option value="day" className="bg-secondary-800 text-white">Day(s)</option>
                      <option value="week" className="bg-secondary-800 text-white">Week(s)</option>
                      <option value="month" className="bg-secondary-800 text-white">Month(s)</option>
                      <option value="year" className="bg-secondary-800 text-white">Year(s)</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-1">Trial Period (days)</label>
                  <input
                    type="number"
                    value={formData.trial_period_days}
                    onChange={(e) => setFormData({...formData, trial_period_days: parseInt(e.target.value) || 0})}
                    min="0"
                    className="w-full px-3 py-2 border border-secondary-700 rounded-md bg-secondary-800 text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-secondary-700 rounded-md bg-secondary-800 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">Features</label>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-secondary-700 rounded-md bg-secondary-800 text-white"
                        placeholder="Feature description"
                      />
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="ml-2 p-2 text-red-400 hover:text-red-300"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFeature}
                    className="flex items-center text-primary-400 hover:text-primary-300 text-sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Feature
                  </button>
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="h-4 w-4 text-primary-500 bg-secondary-800 border-secondary-700 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-secondary-300">
                  Active
                </label>
              </div>
              
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  <Save className="h-5 w-5 mr-1" />
                  {editingPlan ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center bg-secondary-700 text-white px-4 py-2 rounded-md hover:bg-secondary-800"
                >
                  <X className="h-5 w-5 mr-1" />
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
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Interval</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Trial</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-secondary-900 divide-y divide-secondary-800">
              {plans?.map((plan) => (
                <tr key={plan.id} className="hover:bg-secondary-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{plan.name}</div>
                    <div className="text-sm text-secondary-400">{plan.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    ${plan.price}/{plan.interval_count > 1 ? `${plan.interval_count} ` : ''}{plan.interval_type}{plan.interval_count > 1 ? 's' : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-400">
                    Every {plan.interval_count} {plan.interval_type}{plan.interval_count > 1 ? 's' : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-400">
                    {plan.trial_period_days > 0 ? `${plan.trial_period_days} days` : 'None'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      plan.is_active ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'
                    }`}>
                      {plan.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => startEditing(plan)}
                      className="text-primary-400 hover:text-primary-300 mr-3"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {(!plans || plans.length === 0) && (
            <div className="text-center py-8 text-secondary-400">
              No subscription plans found. Create your first plan using the "Add Plan" button.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}