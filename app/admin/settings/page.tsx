'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/AdminLayout'
import { CheckCircle, XCircle, CreditCard, Mail, Upload, Trash2, ImageIcon, Loader2 } from 'lucide-react'

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    storeName: '',
    storeEmail: '',
    storeAddress: '',
    storeCity: '',
    storeState: '',
    storeZip: '',
    currency: 'USD',
    timezone: 'America/New_York',
    enableNotifications: true,
    enableNewsletter: true,
    enableReviews: true,
    enableWishlist: true,
    stripePublishableKey: '',
    stripeSecretKey: '',
    stripeWebhookSecret: '',
    isStripeSecretKeySet: false,
    isStripeWebhookSecretSet: false,
    logoUrl: '',
  })

  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  // Load settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings')
        if (response.ok) {
          const data = await response.json()
          setSettings(prev => ({
            ...prev,
            ...data.settings
          }))
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error)
      }
    }
    fetchSettings()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingLogo(true)
    setSaveStatus(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'branding')

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Upload failed')

      const updatedSettings = { ...settings, logoUrl: data.url }
      setSettings(updatedSettings)

      // Save immediately so the logo persists
      const saveRes = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
      })

      if (saveRes.ok) {
        setSaveStatus({ type: 'success', message: 'Logo uploaded and saved!' })
      } else {
        setSaveStatus({ type: 'error', message: 'Logo uploaded but failed to save settings.' })
      }
    } catch (error: any) {
      setSaveStatus({ type: 'error', message: 'Failed to upload logo: ' + (error.message || 'Unknown error') })
    } finally {
      setIsUploadingLogo(false)
      if (logoInputRef.current) logoInputRef.current.value = ''
    }
  }

  const handleRemoveLogo = async () => {
    const updatedSettings = { ...settings, logoUrl: '' }
    setSettings(updatedSettings)
    setSaveStatus(null)

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
      })

      if (res.ok) {
        setSaveStatus({ type: 'success', message: 'Logo removed successfully!' })
      } else {
        setSaveStatus({ type: 'error', message: 'Failed to remove logo.' })
      }
    } catch {
      setSaveStatus({ type: 'error', message: 'Failed to remove logo.' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveStatus(null)

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        setSaveStatus({ type: 'success', message: 'Settings saved successfully!' })
        // Refresh settings to update badges
        const refreshResponse = await fetch('/api/admin/settings')
        if (refreshResponse.ok) {
          const data = await refreshResponse.json()
          setSettings(prev => ({ ...prev, ...data.settings }))
        }
      } else {
        const errorData = await response.json()
        setSaveStatus({ type: 'error', message: errorData.error || 'Failed to save settings. Please try again.' })
      }
    } catch (error) {
      // ... existing error handler
      setSaveStatus({ type: 'error', message: 'Failed to save settings. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div className="text-white">
        <h1 className="text-2xl font-bold text-white mb-6">Store Settings</h1>

        {saveStatus && (
          <div className={`mb-6 p-4 rounded-md flex items-center ${saveStatus.type === 'success'
              ? 'bg-green-800 text-green-200'
              : 'bg-red-800 text-red-200'
            }`}>
            {saveStatus.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <XCircle className="h-5 w-5 mr-2" />
            )}
            {saveStatus.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-secondary-900 rounded-lg shadow p-6">
          {/* Store Logo Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <ImageIcon className="mr-2 h-5 w-5" />
              <span>Store Logo</span>
            </h2>
            <p className="text-secondary-300 mb-4">Upload your store logo. It will appear in the site header and browser tab.</p>

            <div className="flex items-start gap-6">
              {/* Preview */}
              <div className="w-48 h-24 bg-secondary-800 border border-secondary-700 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                {settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt="Store logo"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="text-secondary-500 text-sm text-center">
                    <ImageIcon className="h-8 w-8 mx-auto mb-1 opacity-50" />
                    No logo set
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={isUploadingLogo}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-md hover:bg-primary-600 disabled:opacity-50"
                >
                  {isUploadingLogo ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {isUploadingLogo ? 'Uploading...' : 'Upload Logo'}
                </button>
                {settings.logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove Logo
                  </button>
                )}
                <p className="text-secondary-400 text-xs">Recommended: PNG or SVG, max width 500px</p>
              </div>
            </div>
          </div>

          {/* Store Information Section */}
          <div className="mb-8 border-t border-secondary-800 pt-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <span className="mr-2">Store Information</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="storeName" className="block text-sm font-medium text-white mb-1">
                  Store Name
                </label>
                <input
                  type="text"
                  id="storeName"
                  name="storeName"
                  value={settings.storeName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-secondary-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-secondary-800 text-white"
                />
              </div>

              <div>
                <label htmlFor="storeEmail" className="block text-sm font-medium text-white mb-1">
                  Store Email
                </label>
                <input
                  type="email"
                  id="storeEmail"
                  name="storeEmail"
                  value={settings.storeEmail}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-secondary-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-secondary-800 text-white"
                />
              </div>

              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-white mb-1">
                  Currency
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={settings.currency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-secondary-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-secondary-800 text-white"
                >
                  <option value="USD" className="bg-secondary-800 text-white">US Dollar (USD)</option>
                  <option value="EUR" className="bg-secondary-800 text-white">Euro (EUR)</option>
                  <option value="GBP" className="bg-secondary-800 text-white">British Pound (GBP)</option>
                  <option value="CAD" className="bg-secondary-800 text-white">Canadian Dollar (CAD)</option>
                </select>
              </div>

              <div>
                <label htmlFor="timezone" className="block text-sm font-medium text-white mb-1">
                  Timezone
                </label>
                <select
                  id="timezone"
                  name="timezone"
                  value={settings.timezone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-secondary-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-secondary-800 text-white"
                >
                  <option value="America/New_York" className="bg-secondary-800 text-white">Eastern Time (US)</option>
                  <option value="America/Chicago" className="bg-secondary-800 text-white">Central Time (US)</option>
                  <option value="America/Denver" className="bg-secondary-800 text-white">Mountain Time (US)</option>
                  <option value="America/Los_Angeles" className="bg-secondary-800 text-white">Pacific Time (US)</option>
                  <option value="UTC" className="bg-secondary-800 text-white">Coordinated Universal Time</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-white">Features</label>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableNotifications"
                    name="enableNotifications"
                    checked={settings.enableNotifications}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-500 focus:ring-primary-400 border-secondary-700 rounded bg-secondary-800"
                  />
                  <label htmlFor="enableNotifications" className="ml-2 block text-sm text-white">
                    Enable Notifications
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableNewsletter"
                    name="enableNewsletter"
                    checked={settings.enableNewsletter}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-500 focus:ring-primary-400 border-secondary-700 rounded bg-secondary-800"
                  />
                  <label htmlFor="enableNewsletter" className="ml-2 block text-sm text-white">
                    Enable Newsletter Signup
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableReviews"
                    name="enableReviews"
                    checked={settings.enableReviews}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-500 focus:ring-primary-400 border-secondary-700 rounded bg-secondary-800"
                  />
                  <label htmlFor="enableReviews" className="ml-2 block text-sm text-white">
                    Enable Product Reviews
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableWishlist"
                    name="enableWishlist"
                    checked={settings.enableWishlist}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-500 focus:ring-primary-400 border-secondary-700 rounded bg-secondary-800"
                  />
                  <label htmlFor="enableWishlist" className="ml-2 block text-sm text-white">
                    Enable Wishlist
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Stripe Configuration Section */}
          <div className="mb-8 border-t border-secondary-800 pt-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <CreditCard className="mr-2" />
              <span>Stripe Configuration</span>
            </h2>
            <p className="text-secondary-300 mb-4">Configure your Stripe API keys to enable payment processing</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="stripePublishableKey" className="block text-sm font-medium text-white mb-1">
                  Publishable Key
                </label>
                <input
                  type="text"
                  id="stripePublishableKey"
                  name="stripePublishableKey"
                  value={settings.stripePublishableKey}
                  onChange={handleChange}
                  placeholder="pk_test_..."
                  className="w-full px-3 py-2 border border-secondary-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-secondary-800 text-white"
                />
                <p className="mt-1 text-sm text-secondary-400">
                  Begins with pk_test_ (test) or pk_live_ (live). Found in Stripe Dashboard &gt; Developers &gt; API keys.
                </p>
              </div>

              <div>
                <label htmlFor="stripeSecretKey" className="block text-sm font-medium text-white mb-1">
                  Secret Key
                  {settings.isStripeSecretKeySet && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-900 text-green-200">
                      Configured
                    </span>
                  )}
                </label>
                <input
                  type="password"
                  id="stripeSecretKey"
                  name="stripeSecretKey"
                  value={settings.stripeSecretKey}
                  onChange={handleChange}
                  placeholder={settings.isStripeSecretKeySet ? "•••••••••••• (Hidden for security)" : "sk_test_..."}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-secondary-800 text-white ${settings.isStripeSecretKeySet ? 'border-green-700' : 'border-secondary-700'
                    }`}
                />
                <p className="mt-1 text-sm text-secondary-400">
                  Begins with sk_test_ (test) or sk_live_ (live). Found in Stripe Dashboard &gt; Developers &gt; API keys.
                </p>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="stripeWebhookSecret" className="block text-sm font-medium text-white mb-1">
                  Webhook Secret
                  {settings.isStripeWebhookSecretSet && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-900 text-green-200">
                      Configured
                    </span>
                  )}
                </label>
                <input
                  type="password"
                  id="stripeWebhookSecret"
                  name="stripeWebhookSecret"
                  value={settings.stripeWebhookSecret}
                  onChange={handleChange}
                  placeholder={settings.isStripeWebhookSecretSet ? "•••••••••••• (Hidden for security)" : "whsec_..."}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-secondary-800 text-white ${settings.isStripeWebhookSecretSet ? 'border-green-700' : 'border-secondary-700'
                    }`}
                />
                <p className="mt-1 text-sm text-secondary-400">
                  Begins with whsec_. Found in Stripe Dashboard &gt; Developers &gt; Webhooks. Required for processing payment confirmations.
                </p>
              </div>
            </div>
          </div>

          {/* Email Configuration Section */}
          <div className="mb-8 border-t border-secondary-800 pt-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Mail className="mr-2" />
              <span>Email Configuration</span>
            </h2>
            <p className="text-secondary-300 mb-4">Configure your email settings and templates</p>

            <div className="bg-secondary-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-white">SMTP and Templates</h3>
                  <p className="text-secondary-300 mt-1">Manage your email service configuration and customize email templates</p>
                </div>
                <Link
                  href="/admin/settings/email"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Configure Email
                </Link>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}