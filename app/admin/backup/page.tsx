'use client'

import { useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Download, Upload, Database, AlertTriangle } from 'lucide-react'

export default function AdminBackup() {
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [backupStatus, setBackupStatus] = useState<string | null>(null)

  const handleBackup = async () => {
    setIsBackingUp(true)
    setBackupStatus(null)

    try {
      const response = await fetch('/api/admin/backup', { method: 'POST' })
      const data = await response.json()

      if (response.ok) {
        setBackupStatus('Backup created successfully!')
        // Trigger download
        const link = document.createElement('a')
        link.href = data.downloadUrl
        link.download = data.filename
        link.click()
      } else {
        setBackupStatus('Backup failed: ' + data.error)
      }
    } catch (error) {
      setBackupStatus('Backup failed: Network error')
    } finally {
      setIsBackingUp(false)
    }
  }

  const handleRestore = async (file: File) => {
    setIsRestoring(true)
    setBackupStatus(null)

    const formData = new FormData()
    formData.append('backup', file)

    try {
      const response = await fetch('/api/admin/restore', {
        method: 'POST',
        body: formData
      })
      const data = await response.json()

      if (response.ok) {
        setBackupStatus('Database restored successfully!')
      } else {
        setBackupStatus('Restore failed: ' + data.error)
      }
    } catch (error) {
      setBackupStatus('Restore failed: Network error')
    } finally {
      setIsRestoring(false)
    }
  }

  return (
    <AdminLayout>
      <div className="text-white">
        <h1 className="text-2xl font-bold mb-6">Database Backup & Restore</h1>

        {backupStatus && (
          <div className={`mb-6 p-4 rounded-md ${backupStatus.includes('failed') ? 'bg-red-800 text-red-200' : 'bg-green-800 text-green-200'
            }`}>
            {backupStatus}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Backup Section */}
          <div className="bg-secondary-900 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Database className="h-6 w-6 mr-2 text-primary-400" />
              <h2 className="text-xl font-semibold">Create Backup</h2>
            </div>
            <p className="text-secondary-300 mb-4">
              Create a complete backup of your database including all products, orders, users, and settings.
            </p>
            <button
              onClick={handleBackup}
              disabled={isBackingUp}
              className="w-full bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 disabled:opacity-50 flex items-center justify-center"
            >
              <Download className="h-4 w-4 mr-2" />
              {isBackingUp ? 'Creating Backup...' : 'Download Backup'}
            </button>
          </div>

          {/* Restore Section */}
          <div className="bg-secondary-900 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Upload className="h-6 w-6 mr-2 text-green-400" />
              <h2 className="text-xl font-semibold">Restore Database</h2>
            </div>
            <div className="bg-yellow-800 border border-yellow-600 rounded-md p-3 mb-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
                <span className="text-yellow-200 text-sm">
                  Warning: This will replace all current data!
                </span>
              </div>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file && confirm('Are you sure you want to restore from this backup? This will replace all current data.')) {
                  handleRestore(file)
                }
              }}
              disabled={isRestoring}
              className="w-full text-white bg-secondary-800 border border-secondary-700 rounded-md px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700"
            />
            {isRestoring && (
              <p className="text-yellow-400 text-sm mt-2">Restoring database...</p>
            )}
          </div>
        </div>

        {/* Backup Schedule */}
        <div className="mt-8 bg-secondary-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Automated Backups</h2>
          <p className="text-secondary-300 mb-4">
            Configure automatic daily backups to ensure your data is always protected.
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">Daily Backup Schedule</p>
              <p className="text-secondary-400 text-sm">Runs every day at 2:00 AM</p>
            </div>
            <div className="flex items-center">
              <span className="text-green-400 text-sm mr-2">Enabled</span>
              <div className="w-12 h-6 bg-green-600 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}