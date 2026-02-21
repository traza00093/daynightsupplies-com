'use client'

import { useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Upload, Download, FileText, CheckCircle } from 'lucide-react'

export default function BulkOperations() {
  const [activeTab, setActiveTab] = useState('import')
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const handleImport = async (file: File) => {
    setIsProcessing(true)
    setStatus(null)
    
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const response = await fetch('/api/admin/bulk/import', {
        method: 'POST',
        body: formData
      })
      const data = await response.json()
      
      if (response.ok) {
        setStatus(`Successfully imported ${data.count} products`)
      } else {
        setStatus('Import failed: ' + data.error)
      }
    } catch (error) {
      setStatus('Import failed: Network error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExport = async (format: string) => {
    setIsProcessing(true)
    
    try {
      const response = await fetch(`/api/admin/bulk/export?format=${format}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `products.${format}`
        a.click()
        setStatus('Export completed successfully')
      }
    } catch (error) {
      setStatus('Export failed')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <AdminLayout>
      <div className="text-white">
        <h1 className="text-2xl font-bold mb-6">Bulk Operations</h1>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'import' ? 'bg-primary-500' : 'bg-secondary-800'
            }`}
          >
            Import Products
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'export' ? 'bg-primary-500' : 'bg-secondary-800'
            }`}
          >
            Export Products
          </button>
        </div>

        {status && (
          <div className={`mb-6 p-4 rounded-md ${
            status.includes('failed') ? 'bg-red-800 text-red-200' : 'bg-green-800 text-green-200'
          }`}>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              {status}
            </div>
          </div>
        )}

        {activeTab === 'import' && (
          <div className="bg-secondary-900 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Upload className="h-6 w-6 mr-2 text-primary-400" />
              <h2 className="text-xl font-semibold">Import Products</h2>
            </div>
            <p className="text-secondary-300 mb-4">
              Upload a CSV file to bulk import products. Download the template to see the required format.
            </p>
            
            <div className="mb-4">
              <a
                href="/api/admin/bulk/template"
                className="inline-flex items-center px-4 py-2 bg-secondary-700 text-white rounded-md hover:bg-secondary-800"
              >
                <FileText className="h-4 w-4 mr-2" />
                Download Template
              </a>
            </div>

            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImport(file)
              }}
              disabled={isProcessing}
              className="w-full text-white bg-secondary-800 border border-secondary-700 rounded-md px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-500 file:text-white hover:file:bg-primary-600"
            />
            {isProcessing && (
              <p className="text-yellow-400 text-sm mt-2">Processing import...</p>
            )}
          </div>
        )}

        {activeTab === 'export' && (
          <div className="bg-secondary-900 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Download className="h-6 w-6 mr-2 text-green-400" />
              <h2 className="text-xl font-semibold">Export Products</h2>
            </div>
            <p className="text-secondary-300 mb-4">
              Export all products to CSV or Excel format for backup or external processing.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleExport('csv')}
                disabled={isProcessing}
                className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export as CSV
              </button>
              <button
                onClick={() => handleExport('xlsx')}
                disabled={isProcessing}
                className="flex items-center justify-center px-4 py-3 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export as Excel
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}