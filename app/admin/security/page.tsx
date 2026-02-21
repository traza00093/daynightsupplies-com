'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Shield, Eye, AlertTriangle, Clock } from 'lucide-react'

interface SecurityLog {
  id: number
  event_type: string
  user_email: string
  ip_address: string
  user_agent: string
  timestamp: string
  details: string
}

export default function SecurityLogs() {
  const [logs, setLogs] = useState<SecurityLog[]>([])
  const [filter, setFilter] = useState('all')
  const [securitySettings, setSecuritySettings] = useState({
    enableLoginLogging: true,
    enableFailedLoginAlerts: true,
    maxFailedAttempts: 5,
    lockoutDuration: 30,
    enableIPBlocking: true
  })

  useEffect(() => {
    fetchLogs()
  }, [filter])

  const fetchLogs = async () => {
    try {
      const response = await fetch(`/api/admin/security/logs?filter=${filter}`)
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs || [])
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
      // Mock data
      setLogs([
        { id: 1, event_type: 'login_success', user_email: 'admin@example.com', ip_address: '192.168.1.1', user_agent: 'Chrome', timestamp: '2024-01-15T10:30:00Z', details: 'Successful admin login' },
        { id: 2, event_type: 'login_failed', user_email: 'unknown@test.com', ip_address: '192.168.1.100', user_agent: 'Firefox', timestamp: '2024-01-15T09:15:00Z', details: 'Failed login attempt' }
      ])
    }
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'login_success': return <Shield className="h-4 w-4 text-green-400" />
      case 'login_failed': return <AlertTriangle className="h-4 w-4 text-red-400" />
      case 'password_change': return <Eye className="h-4 w-4 text-primary-400" />
      default: return <Clock className="h-4 w-4 text-secondary-400" />
    }
  }

  const updateSettings = async () => {
    try {
      await fetch('/api/admin/security/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(securitySettings)
      })
    } catch (error) {
      console.error('Failed to update settings:', error)
    }
  }

  return (
    <AdminLayout>
      <div className="text-white">
        <h1 className="text-2xl font-bold mb-6">Security & Access Logs</h1>

        {/* Security Settings */}
        <div className="bg-secondary-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={securitySettings.enableLoginLogging}
                  onChange={(e) => setSecuritySettings({...securitySettings, enableLoginLogging: e.target.checked})}
                  className="h-4 w-4 text-primary-500 rounded mr-2"
                />
                Enable Login Logging
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={securitySettings.enableFailedLoginAlerts}
                  onChange={(e) => setSecuritySettings({...securitySettings, enableFailedLoginAlerts: e.target.checked})}
                  className="h-4 w-4 text-primary-500 rounded mr-2"
                />
                Failed Login Alerts
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={securitySettings.enableIPBlocking}
                  onChange={(e) => setSecuritySettings({...securitySettings, enableIPBlocking: e.target.checked})}
                  className="h-4 w-4 text-primary-500 rounded mr-2"
                />
                Enable IP Blocking
              </label>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Max Failed Attempts</label>
                <input
                  type="number"
                  value={securitySettings.maxFailedAttempts}
                  onChange={(e) => setSecuritySettings({...securitySettings, maxFailedAttempts: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-secondary-700 rounded-md bg-secondary-800 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Lockout Duration (minutes)</label>
                <input
                  type="number"
                  value={securitySettings.lockoutDuration}
                  onChange={(e) => setSecuritySettings({...securitySettings, lockoutDuration: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-secondary-700 rounded-md bg-secondary-800 text-white"
                />
              </div>
            </div>
          </div>
          <button
            onClick={updateSettings}
            className="mt-4 bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600"
          >
            Save Settings
          </button>
        </div>

        {/* Logs Filter */}
        <div className="bg-secondary-900 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Access Logs</h2>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-secondary-700 rounded-md bg-secondary-800 text-white"
            >
              <option value="all">All Events</option>
              <option value="login_success">Successful Logins</option>
              <option value="login_failed">Failed Logins</option>
              <option value="password_change">Password Changes</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-800">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-secondary-300 uppercase">Event</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-secondary-300 uppercase">User</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-secondary-300 uppercase">IP Address</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-secondary-300 uppercase">Time</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-secondary-300 uppercase">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-800">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-4 py-2 text-sm">
                      <div className="flex items-center">
                        {getEventIcon(log.event_type)}
                        <span className="ml-2">{log.event_type.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm">{log.user_email}</td>
                    <td className="px-4 py-2 text-sm">{log.ip_address}</td>
                    <td className="px-4 py-2 text-sm">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm">{log.details}</td>
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