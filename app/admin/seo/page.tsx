'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Search, Globe, FileText } from 'lucide-react'

export default function SEOManagement() {
  const [seoSettings, setSeoSettings] = useState({
    siteTitle: '',
    siteDescription: 'Online Store',
    keywords: 'ecommerce, daily essentials, online store',
    ogImage: '',
    twitterCard: 'summary_large_image',
    googleAnalytics: '',
    googleSearchConsole: '',
    robotsTxt: 'User-agent: *\nAllow: /',
    enableSitemap: true
  })

  const [pages, setPages] = useState([
    { id: 1, path: '/', title: 'Home', description: 'Shop quality products for your daily needs', keywords: 'home, products, shop' },
    { id: 2, path: '/products', title: 'Products', description: 'Browse our product catalog', keywords: 'products, catalog, browse' }
  ])

  const handleSave = async () => {
    try {
      await fetch('/api/admin/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seoSettings)
      })
    } catch (error) {
      console.error('Failed to save SEO settings:', error)
    }
  }

  const generateSitemap = async () => {
    try {
      const response = await fetch('/api/admin/seo/sitemap', { method: 'POST' })
      if (response.ok) {
        alert('Sitemap generated successfully')
      }
    } catch (error) {
      console.error('Failed to generate sitemap:', error)
    }
  }

  return (
    <AdminLayout>
      <div className="text-white">
        <h1 className="text-2xl font-bold mb-6">SEO Management</h1>

        {/* Global SEO Settings */}
        <div className="bg-secondary-900 rounded-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <Globe className="h-6 w-6 mr-2 text-primary-400" />
            <h2 className="text-xl font-semibold">Global SEO Settings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Site Title</label>
              <input
                type="text"
                value={seoSettings.siteTitle}
                onChange={(e) => setSeoSettings({...seoSettings, siteTitle: e.target.value})}
                className="w-full px-3 py-2 border border-secondary-700 rounded-md bg-secondary-800 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Meta Description</label>
              <textarea
                value={seoSettings.siteDescription}
                onChange={(e) => setSeoSettings({...seoSettings, siteDescription: e.target.value})}
                className="w-full px-3 py-2 border border-secondary-700 rounded-md bg-secondary-800 text-white"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Keywords</label>
              <input
                type="text"
                value={seoSettings.keywords}
                onChange={(e) => setSeoSettings({...seoSettings, keywords: e.target.value})}
                className="w-full px-3 py-2 border border-secondary-700 rounded-md bg-secondary-800 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">OG Image URL</label>
              <input
                type="url"
                value={seoSettings.ogImage}
                onChange={(e) => setSeoSettings({...seoSettings, ogImage: e.target.value})}
                className="w-full px-3 py-2 border border-secondary-700 rounded-md bg-secondary-800 text-white"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600"
          >
            Save Settings
          </button>
        </div>

        {/* Page-specific SEO */}
        <div className="bg-secondary-900 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Search className="h-6 w-6 mr-2 text-green-400" />
              <h2 className="text-xl font-semibold">Page SEO</h2>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-800">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-secondary-300 uppercase">Page</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-secondary-300 uppercase">Title</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-secondary-300 uppercase">Description</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-secondary-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-800">
                {pages.map((page) => (
                  <tr key={page.id}>
                    <td className="px-4 py-2 text-sm">{page.path}</td>
                    <td className="px-4 py-2 text-sm">{page.title}</td>
                    <td className="px-4 py-2 text-sm">{page.description}</td>
                    <td className="px-4 py-2 text-sm">
                      <button className="text-primary-400 hover:text-primary-300">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sitemap & Robots */}
        <div className="bg-secondary-900 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <FileText className="h-6 w-6 mr-2 text-purple-400" />
            <h2 className="text-xl font-semibold">Sitemap & Robots</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Sitemap</h3>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={seoSettings.enableSitemap}
                    onChange={(e) => setSeoSettings({...seoSettings, enableSitemap: e.target.checked})}
                    className="h-4 w-4 text-primary-500 rounded mr-2"
                  />
                  Enable Sitemap
                </label>
                <button
                  onClick={generateSitemap}
                  className="bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700 text-sm"
                >
                  Generate
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Robots.txt</h3>
              <textarea
                value={seoSettings.robotsTxt}
                onChange={(e) => setSeoSettings({...seoSettings, robotsTxt: e.target.value})}
                className="w-full px-3 py-2 border border-secondary-700 rounded-md bg-secondary-800 text-white text-sm"
                rows={3}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}