'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Truck, Package, Settings, Plus, Trash2 } from 'lucide-react'

interface ShippingCarrier {
  id: string
  name: string
  code: string
  service_name?: string
  base_delivery_days?: number
  api_endpoint?: string
  api_key?: string
  api_secret?: string
  test_mode: boolean
  active: boolean
}

export default function ShippingManagementPage() {
  const [carriers, setCarriers] = useState<ShippingCarrier[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Simple shipping state
  const [simpleShippingEnabled, setSimpleShippingEnabled] = useState(false)
  const [simpleShippingText, setSimpleShippingText] = useState('Free shipping, normally shipped within 3-5 days')

  useEffect(() => {
    fetchCarriers()
    fetchSettings()
  }, [])

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      const data = await response.json()
      if (data.settings) {
        setSimpleShippingEnabled(data.settings.simpleShippingEnabled)
        if (data.settings.simpleShippingText) {
          setSimpleShippingText(data.settings.simpleShippingText)
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const fetchCarriers = async () => {
    try {
      const response = await fetch('/api/admin/carriers')
      const data = await response.json()
      setCarriers(data.carriers || [])
    } catch (error) {
      console.error('Error fetching carriers:', error)
      showMessage('error', 'Failed to load shipping carriers')
    } finally {
      setLoading(false)
    }
  }

  const deleteCarrier = async (carrierId: string) => {
    if (!confirm('Are you sure you want to delete this carrier?')) return

    setSaving(true)
    try {
      const response = await fetch(`/api/shipping/carriers?id=${carrierId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        showMessage('success', 'Carrier deleted successfully')
        fetchCarriers()
      } else {
        showMessage('error', 'Failed to delete carrier')
      }
    } catch (error) {
      console.error('Error deleting carrier:', error)
      showMessage('error', 'Failed to delete carrier')
    } finally {
      setSaving(false)
    }
  }

  const saveSimpleShipping = async () => {
    setSaving(true)
    try {
      // We need to fetch current settings first to merge, or just send partial update if API supports it
      // The API seems to expect all settings or at least the ones we want to update. 
      // Let's first get current settings to be safe, although PUT usually merges in our db helpers, 
      // the route handler constructs a new object.
      // Actually, let's just send what we have. API route uses updateSettings which likely merges?
      // Checking route.ts: 
      // const transformedSettings = { ... } (explicit list)
      // then updateSettings('general', transformedSettings)
      // So we need to be careful not to overwrite other settings with undefined.
      // But wait, our route.ts maps from request body fields. If we only send some fields, others will be undefined in the object.
      // The updateSettings function in lib/db.ts uses .update() which merges fields.
      // However, the route.ts constructs a full object with keys.
      // Let's check route.ts logic again.
      // const transformedSettings = { store_name: settingsData.storeName ... }
      // If settingsData.storeName is undefined, it sets store_name: undefined.
      // Firestore update ignores undefined? No, it might error or delete.
      // We should fetch existing settings first.

      const currentSettingsRes = await fetch('/api/admin/settings')
      const currentSettingsData = await currentSettingsRes.json()
      const current = currentSettingsData.settings || {}

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...current,
          simpleShippingEnabled,
          simpleShippingText
        })
      })

      if (response.ok) {
        showMessage('success', 'Shipping mode updated successfully')
      } else {
        showMessage('error', 'Failed to update shipping mode')
      }
    } catch (error) {
      console.error('Error updating shipping mode:', error)
      showMessage('error', 'Failed to update shipping mode')
    } finally {
      setSaving(false)
    }
  }

  const updateCarrier = async (carrierId: string, config: Partial<ShippingCarrier>) => {
    setSaving(true)
    try {
      const response = await fetch('/api/shipping/carriers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carrierId, config })
      })

      if (response.ok) {
        showMessage('success', 'Carrier updated successfully')
        fetchCarriers()
      } else {
        showMessage('error', 'Failed to update carrier')
      }
    } catch (error) {
      console.error('Error updating carrier:', error)
      showMessage('error', 'Failed to update carrier')
    } finally {
      setSaving(false)
    }
  }

  const addCarrier = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)

    const carrierData = {
      name: formData.get('name'),
      code: formData.get('code'),
      service_name: formData.get('service_name'),
      base_delivery_days: parseInt(formData.get('base_delivery_days') as string || '5')
    }

    setSaving(true)
    try {
      const response = await fetch('/api/shipping/carriers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(carrierData)
      })

      if (response.ok) {
        showMessage('success', 'Carrier added successfully')
        setShowAddModal(false)
        fetchCarriers()
      } else {
        showMessage('error', 'Failed to add carrier')
      }
    } catch (error) {
      console.error('Error adding carrier:', error)
      showMessage('error', 'Failed to add carrier')
    } finally {
      setSaving(false)
    }
  }

  const handleCarrierChange = (carrierId: string, field: string, value: any) => {
    setCarriers(prev => prev.map(carrier =>
      carrier.id === carrierId ? { ...carrier, [field]: value } : carrier
    ))
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
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Truck className="h-6 w-6 text-white" />
            <h1 className="text-2xl font-bold text-white">Shipping Management</h1>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-primary-500 hover:bg-primary-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Carrier
          </Button>
        </div>

        {message && (
          <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>
            {message.text}
          </div>
        )}

        {/* Simple Shipping Mode Configuration */}
        <Card className="bg-secondary-900 border-secondary-800">
          <CardHeader>
            <CardTitle className="text-white">Shipping Mode</CardTitle>
            <CardDescription className="text-secondary-400">
              Configure how shipping is calculated. You can use carrier APIs or a simple flat message.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-white text-base">Enable Simple Shipping (Free Shipping)</Label>
                <p className="text-sm text-secondary-400">
                  When enabled, all carrier rates are ignored. Customers will see the message defined below.
                </p>
              </div>
              <Switch
                checked={simpleShippingEnabled}
                onCheckedChange={setSimpleShippingEnabled}
              />
            </div>

            {simpleShippingEnabled && (
              <div className="space-y-2">
                <Label className="text-secondary-300">Shipping Statement</Label>
                <div className="flex gap-4">
                  <Input
                    value={simpleShippingText}
                    onChange={(e) => setSimpleShippingText(e.target.value)}
                    placeholder="Free shipping, normally shipped within 3-5 days"
                    className="bg-secondary-800 border-secondary-700 text-white"
                  />
                  <Button
                    onClick={saveSimpleShipping}
                    disabled={saving}
                    className="bg-primary-500 hover:bg-primary-600"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

            {!simpleShippingEnabled && (
              <div className="flex justify-end">
                <Button
                  onClick={saveSimpleShipping}
                  disabled={saving}
                  className="bg-primary-500 hover:bg-primary-600"
                >
                  Save Mode Selection
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {simpleShippingEnabled && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-yellow-200">
            Note: Simple Shipping is enabled. The carriers below will not be used for rate calculation during checkout, but you can still configure them.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {carriers.map((carrier) => (
            <Card key={carrier.id} className="bg-secondary-900 border-secondary-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Package className="h-5 w-5" />
                  {carrier.name}
                </CardTitle>
                <CardDescription className="text-secondary-400">
                  Configure {carrier.name} shipping settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={carrier.active}
                    onCheckedChange={(checked) => {
                      handleCarrierChange(carrier.id, 'active', checked)
                      updateCarrier(carrier.id, { active: checked })
                    }}
                  />
                  <Label className="text-secondary-300">Active</Label>
                </div>

                {carrier.code !== 'standard' && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-secondary-300">Service Name</Label>
                      <Input
                        value={carrier.service_name || ''}
                        onChange={(e) => handleCarrierChange(carrier.id, 'service_name', e.target.value)}
                        placeholder="Standard Shipping"
                        className="bg-secondary-800 border-secondary-700 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-secondary-300">Base Delivery Days</Label>
                      <Input
                        type="number"
                        value={carrier.base_delivery_days || 5}
                        onChange={(e) => handleCarrierChange(carrier.id, 'base_delivery_days', parseInt(e.target.value))}
                        className="bg-secondary-800 border-secondary-700 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-secondary-300">API Endpoint</Label>
                      <Input
                        value={carrier.api_endpoint || ''}
                        onChange={(e) => handleCarrierChange(carrier.id, 'api_endpoint', e.target.value)}
                        placeholder="https://api.carrier.com"
                        className="bg-secondary-800 border-secondary-700 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-secondary-300">API Key</Label>
                      <Input
                        value={carrier.api_key || ''}
                        onChange={(e) => handleCarrierChange(carrier.id, 'api_key', e.target.value)}
                        placeholder="Your API key"
                        className="bg-secondary-800 border-secondary-700 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-secondary-300">API Secret</Label>
                      <Input
                        type="password"
                        value={carrier.api_secret || ''}
                        onChange={(e) => handleCarrierChange(carrier.id, 'api_secret', e.target.value)}
                        placeholder="Your API secret"
                        className="bg-secondary-800 border-secondary-700 text-white"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={carrier.test_mode}
                        onCheckedChange={(checked) => handleCarrierChange(carrier.id, 'test_mode', checked)}
                      />
                      <Label className="text-secondary-300">Test Mode</Label>
                    </div>

                    <Button
                      onClick={() => updateCarrier(carrier.id, {
                        service_name: carrier.service_name,
                        base_delivery_days: carrier.base_delivery_days,
                        api_endpoint: carrier.api_endpoint,
                        api_key: carrier.api_key,
                        api_secret: carrier.api_secret,
                        test_mode: carrier.test_mode
                      })}
                      disabled={saving}
                      className="w-full bg-primary-500 hover:bg-primary-600"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Configuration'}
                    </Button>

                    <Button
                      variant="destructive"
                      onClick={() => deleteCarrier(carrier.id)}
                      disabled={saving}
                      className="w-full mt-2"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Carrier
                    </Button>
                  </>
                )}

                {/* For standard carrier, just allow delete if needed or maybe hide it? 
                    Standard usually implies some manual rate, but here it seems distinct. 
                    Let's allow deleting any carrier for now. */}
                {carrier.code === 'standard' && (
                  <Button
                    variant="destructive"
                    onClick={() => deleteCarrier(carrier.id)}
                    disabled={saving}
                    className="w-full mt-2"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Carrier
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-secondary-900 border-secondary-800">
          <CardHeader>
            <CardTitle className="text-white">Shipping Information</CardTitle>
            <CardDescription className="text-secondary-400">Current shipping configuration status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-900/30 rounded-lg">
                <div className="text-2xl font-bold text-green-400">
                  {carriers.filter(c => c.active).length}
                </div>
                <div className="text-sm text-green-300">Active Carriers</div>
              </div>
              <div className="text-center p-4 bg-primary-900/30 rounded-lg">
                <div className="text-2xl font-bold text-primary-400">
                  {carriers.filter(c => c.api_key).length}
                </div>
                <div className="text-sm text-primary-300">Configured APIs</div>
              </div>
              <div className="text-center p-4 bg-purple-900/30 rounded-lg">
                <div className="text-2xl font-bold text-purple-400">
                  {carriers.filter(c => c.test_mode).length}
                </div>
                <div className="text-sm text-purple-300">Test Mode</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Carrier Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-secondary-900 rounded-lg max-w-md w-full p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Add New Carrier</h2>
              <form onSubmit={addCarrier} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-secondary-300">Carrier Name</Label>
                  <Input
                    name="name"
                    placeholder="FedEx"
                    required
                    className="bg-secondary-800 border-secondary-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-secondary-300">Carrier Code</Label>
                  <Input
                    name="code"
                    placeholder="fedex"
                    required
                    className="bg-secondary-800 border-secondary-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-secondary-300">Service Name</Label>
                  <Input
                    name="service_name"
                    placeholder="Standard Shipping"
                    className="bg-secondary-800 border-secondary-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-secondary-300">Base Delivery Days</Label>
                  <Input
                    name="base_delivery_days"
                    type="number"
                    defaultValue="5"
                    className="bg-secondary-800 border-secondary-700 text-white"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" disabled={saving} className="flex-1 bg-primary-500 hover:bg-primary-600">
                    {saving ? 'Adding...' : 'Add Carrier'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-secondary-700 hover:bg-secondary-800"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}