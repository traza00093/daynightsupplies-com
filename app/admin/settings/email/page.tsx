'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Mail, Send, Settings, AlertCircle, CheckCircle, Info } from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'

export default function EmailConfigurationPage() {
  const [emailSettings, setEmailSettings] = useState({
    smtp_host: '',
    smtp_port: 0,
    smtp_secure: true,
    smtp_user: '',
    smtp_pass: '',
    email_from_name: '',
    sender_email: '',
    email_template_order_confirmation: '',
    email_template_order_status_update: '',
    email_template_new_order_alert: '',
    email_template_shipping_notification: '',
    email_template_contact_notification: '',
    email_template_password_reset: '',
    email_template_email_verification: ''
  })
  const [activeTab, setActiveTab] = useState('smtp')
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testEmail, setTestEmail] = useState('')

  useEffect(() => {
    fetchEmailSettings()
  }, [])

  const fetchEmailSettings = async () => {
    try {
      const response = await fetch('/api/admin/email-settings')
      const data = await response.json()

      if (data.emailSettings) {
        setEmailSettings(data.emailSettings)
      }
    } catch (error) {
      console.error('Error fetching email settings:', error)
      toast.error('Failed to load email settings')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEmailSettings(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setEmailSettings(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  const validateSettings = () => {
    const errors: Record<string, string> = {}

    if (!emailSettings.smtp_host) errors.smtp_host = 'SMTP host is required'
    if (!emailSettings.smtp_port || emailSettings.smtp_port < 1 || emailSettings.smtp_port > 65535) {
      errors.smtp_port = 'Valid port number (1-65535) is required'
    }
    if (!emailSettings.smtp_user) errors.smtp_user = 'SMTP username is required'
    if (!emailSettings.smtp_pass) errors.smtp_pass = 'SMTP password is required'
    if (!emailSettings.email_from_name) errors.email_from_name = 'From name is required'

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!validateSettings()) {
      toast.error('Please fix validation errors before saving')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/admin/email-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ emailSettings })
      })

      if (response.ok) {
        toast.success('Email settings saved successfully!')
        setConnectionStatus('idle')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to save email settings')
      }
    } catch (error) {
      console.error('Error saving email settings:', error)
      toast.error('Failed to save email settings')
    } finally {
      setSaving(false)
    }
  }

  const testConnection = async () => {
    if (!validateSettings()) {
      toast.error('Please fix validation errors before testing')
      return
    }

    setConnectionStatus('testing')
    try {
      const response = await fetch('/api/admin/email-settings/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ emailSettings })
      })

      if (response.ok) {
        setConnectionStatus('success')
        toast.success('SMTP connection successful!')
      } else {
        setConnectionStatus('error')
        const errorData = await response.json()
        toast.error(errorData.error || 'SMTP connection failed')
      }
    } catch (error) {
      setConnectionStatus('error')
      console.error('Error testing connection:', error)
      toast.error('Failed to test SMTP connection')
    }
  }

  const loadPreset = (provider: string) => {
    const presets = {
      gmail: {
        smtp_host: 'smtp.gmail.com',
        smtp_port: 587,
        smtp_secure: true
      },
      outlook: {
        smtp_host: 'smtp-mail.outlook.com',
        smtp_port: 587,
        smtp_secure: true
      },
      yahoo: {
        smtp_host: 'smtp.mail.yahoo.com',
        smtp_port: 587,
        smtp_secure: true
      }
    }

    const preset = presets[provider as keyof typeof presets]
    if (preset) {
      setEmailSettings(prev => ({ ...prev, ...preset }))
      toast.success(`${provider.charAt(0).toUpperCase() + provider.slice(1)} settings loaded`)
    }
  }

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address')
      return
    }

    setTesting(true)
    try {
      const response = await fetch('/api/admin/email-settings/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ testEmail })
      })

      if (response.ok) {
        toast.success('Test email sent successfully!')
        setTestEmail('')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to send test email')
      }
    } catch (error) {
      console.error('Error sending test email:', error)
      toast.error('Failed to send test email')
    } finally {
      setTesting(false)
    }
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
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Mail className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Email Configuration</h1>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-secondary-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('smtp')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'smtp' ? 'bg-secondary-900 shadow-sm' : 'hover:bg-secondary-800'
            }`}
        >
          <Settings className="h-4 w-4 inline mr-2" />
          SMTP Settings
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'templates' ? 'bg-secondary-900 shadow-sm' : 'hover:bg-secondary-800'
            }`}
        >
          <Mail className="h-4 w-4 inline mr-2" />
          Email Templates
        </button>
      </div>

      {activeTab === 'smtp' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              SMTP Configuration
            </CardTitle>
            <CardDescription>Configure your email server settings to send notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick Setup Presets */}
            <div className="bg-primary-900/30 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-primary-300 mb-2">Quick Setup</h3>
              <p className="text-sm text-primary-400 mb-3">Choose a preset to automatically configure common email providers:</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => loadPreset('gmail')}>
                  Gmail
                </Button>
                <Button variant="outline" size="sm" onClick={() => loadPreset('outlook')}>
                  Outlook
                </Button>
                <Button variant="outline" size="sm" onClick={() => loadPreset('yahoo')}>
                  Yahoo
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Server Settings</h3>

                <div className="space-y-2">
                  <Label htmlFor="smtp_host">SMTP Host *</Label>
                  <Input
                    id="smtp_host"
                    name="smtp_host"
                    value={emailSettings.smtp_host}
                    onChange={handleInputChange}
                    placeholder="smtp.gmail.com"
                    className={validationErrors.smtp_host ? 'border-red-500' : ''}
                  />
                  {validationErrors.smtp_host && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {validationErrors.smtp_host}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp_port">SMTP Port *</Label>
                  <Input
                    id="smtp_port"
                    name="smtp_port"
                    type="number"
                    value={emailSettings.smtp_port}
                    onChange={handleInputChange}
                    placeholder="587"
                    className={validationErrors.smtp_port ? 'border-red-500' : ''}
                  />
                  {validationErrors.smtp_port && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {validationErrors.smtp_port}
                    </p>
                  )}
                  <p className="text-xs text-secondary-400">Common ports: 587 (TLS), 465 (SSL), 25 (unsecured)</p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="smtp_secure"
                    checked={emailSettings.smtp_secure}
                    onCheckedChange={(checked) => handleSwitchChange('smtp_secure', checked)}
                  />
                  <Label htmlFor="smtp_secure">Use Secure Connection (TLS/SSL)</Label>
                </div>
                <p className="text-xs text-secondary-400">Enable for ports 587 (TLS) or 465 (SSL)</p>

                <div className="space-y-2">
                  <Label htmlFor="smtp_user">SMTP Username *</Label>
                  <Input
                    id="smtp_user"
                    name="smtp_user"
                    value={emailSettings.smtp_user}
                    onChange={handleInputChange}
                    placeholder="your-email@example.com"
                    className={validationErrors.smtp_user ? 'border-red-500' : ''}
                  />
                  {validationErrors.smtp_user && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {validationErrors.smtp_user}
                    </p>
                  )}
                  <p className="text-xs text-secondary-400">Usually your email address</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp_pass">SMTP Password *</Label>
                  <Input
                    id="smtp_pass"
                    name="smtp_pass"
                    type="password"
                    value={emailSettings.smtp_pass}
                    onChange={handleInputChange}
                    placeholder="your-app-password"
                    className={validationErrors.smtp_pass ? 'border-red-500' : ''}
                  />
                  {validationErrors.smtp_pass && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {validationErrors.smtp_pass}
                    </p>
                  )}
                  <p className="text-xs text-secondary-400">Use app password for Gmail/Outlook</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email_from_name">From Name *</Label>
                  <Input
                    id="email_from_name"
                    name="email_from_name"
                    value={emailSettings.email_from_name}
                    onChange={handleInputChange}
                    placeholder="Your Store Name"
                    className={validationErrors.email_from_name ? 'border-red-500' : ''}
                  />
                  {validationErrors.email_from_name && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {validationErrors.email_from_name}
                    </p>
                  )}
                  <p className="text-xs text-secondary-400">Name shown in recipient's inbox</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sender_email">Sender Email Address *</Label>
                  <Input
                    id="sender_email"
                    name="sender_email"
                    value={emailSettings.sender_email || ''} // Handle potentially undefined initially
                    onChange={handleInputChange}
                    placeholder="info@yourstore.com"
                    className={validationErrors.sender_email ? 'border-red-500' : ''}
                  />
                  {validationErrors.sender_email && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {validationErrors.sender_email}
                    </p>
                  )}
                  <p className="text-xs text-secondary-400">Must be a verified domain in your email provider (e.g. Resend)</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Connection Testing</h3>

                {/* Connection Status */}
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    {connectionStatus === 'idle' && <Info className="h-4 w-4 text-secondary-400" />}
                    {connectionStatus === 'testing' && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500" />}
                    {connectionStatus === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {connectionStatus === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                    <span className="text-sm font-medium">
                      {connectionStatus === 'idle' && 'Ready to test connection'}
                      {connectionStatus === 'testing' && 'Testing connection...'}
                      {connectionStatus === 'success' && 'Connection successful!'}
                      {connectionStatus === 'error' && 'Connection failed'}
                    </span>
                  </div>
                  <Button
                    onClick={testConnection}
                    disabled={connectionStatus === 'testing'}
                    variant="outline"
                    className="w-full"
                  >
                    {connectionStatus === 'testing' ? 'Testing...' : 'Test SMTP Connection'}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test_email">Send Test Email</Label>
                  <Input
                    id="test_email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="test@example.com"
                  />
                  <Button
                    onClick={handleTestEmail}
                    disabled={testing || !testEmail}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {testing ? 'Sending...' : 'Send Test Email'}
                  </Button>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-amber-900 mb-2">Setup Instructions</h4>
                  <div className="text-sm text-amber-800 space-y-2">
                    <p><strong>For Gmail:</strong></p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Enable 2-factor authentication</li>
                      <li>Generate an app password (not your regular password)</li>
                      <li>Use smtp.gmail.com, port 587, TLS enabled</li>
                    </ul>
                    <p><strong>For Outlook:</strong></p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Use smtp-mail.outlook.com, port 587, TLS enabled</li>
                      <li>Your regular email and password should work</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setActiveTab('templates')}>
                Next: Configure Templates
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save SMTP Settings'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'templates' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Templates
            </CardTitle>
            <CardDescription>Customize email templates for different notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            <div className="bg-primary-900/30 p-4 rounded-lg mb-6">
              <h4 className="text-sm font-medium text-primary-300 mb-2">Template Variables</h4>
              <p className="text-sm text-primary-400 mb-2">Use these placeholders in your templates:</p>
              <div className="grid grid-cols-2 gap-4 text-xs text-primary-400">
                <div>
                  <p><code>{'{customer_name}'}</code> - Customer's name</p>
                  <p><code>{'{order_number}'}</code> - Order number</p>
                  <p><code>{'{total}'}</code> - Order total</p>
                </div>
                <div>
                  <p><code>{'{status}'}</code> - Order status</p>
                  <p><code>{'{items}'}</code> - Order items table</p>
                  <p><code>{'{tracking_number}'}</code> - Tracking number</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email_template_order_confirmation">Order Confirmation Template</Label>
                <Textarea
                  id="email_template_order_confirmation"
                  name="email_template_order_confirmation"
                  value={emailSettings.email_template_order_confirmation}
                  onChange={handleInputChange}
                  placeholder="HTML template for order confirmation emails (use placeholders like {customer_name}, {order_number}, {items})"
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email_template_order_status_update">Order Status Update Template</Label>
                <Textarea
                  id="email_template_order_status_update"
                  name="email_template_order_status_update"
                  value={emailSettings.email_template_order_status_update}
                  onChange={handleInputChange}
                  placeholder="HTML template for order status update emails"
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email_template_new_order_alert">New Order Alert Template</Label>
                <Textarea
                  id="email_template_new_order_alert"
                  name="email_template_new_order_alert"
                  value={emailSettings.email_template_new_order_alert}
                  onChange={handleInputChange}
                  placeholder="HTML template for new order alert emails to admin"
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email_template_shipping_notification">Shipping Notification Template</Label>
                <Textarea
                  id="email_template_shipping_notification"
                  name="email_template_shipping_notification"
                  value={emailSettings.email_template_shipping_notification}
                  onChange={handleInputChange}
                  placeholder="HTML template for shipping notification emails"
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email_template_contact_notification">Contact Notification Template</Label>
                <Textarea
                  id="email_template_contact_notification"
                  name="email_template_contact_notification"
                  value={emailSettings.email_template_contact_notification}
                  onChange={handleInputChange}
                  placeholder="HTML template for contact form notification emails to admin"
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email_template_password_reset">Password Reset Template</Label>
                <Textarea
                  id="email_template_password_reset"
                  name="email_template_password_reset"
                  value={emailSettings.email_template_password_reset}
                  onChange={handleInputChange}
                  placeholder="HTML template for customer password reset emails (use placeholders like {reset_link}, {store_name})"
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email_template_email_verification">Email Verification Template</Label>
                <Textarea
                  id="email_template_email_verification"
                  name="email_template_email_verification"
                  value={emailSettings.email_template_email_verification}
                  onChange={handleInputChange}
                  placeholder="HTML template for email verification (use placeholders like {verify_link}, {store_name})"
                  rows={6}
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setActiveTab('smtp')}>
                Back: SMTP Settings
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Templates'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </AdminLayout>
  )
}