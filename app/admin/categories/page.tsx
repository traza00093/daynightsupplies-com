'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Plus, Edit, Trash2, X } from 'lucide-react'

export default function AdminCategories() {
  type Category = {
    id: string;
    name: string;
    slug: string;
    icon?: string;
    image_url?: string;
  };

  const [categories, setCategories] = useState<Category[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  // Image Upload State
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  // Reset preview when editing changes
  useEffect(() => {
    if (editingCategory?.image_url) {
      setPreviewUrl(editingCategory.image_url)
    } else {
      setPreviewUrl('')
    }
  }, [editingCategory])

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showModal])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Upload failed')

      setPreviewUrl(data.url)
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)

    const categoryData = {
      name: formData.get('name'),
      slug: formData.get('slug'),
      icon: formData.get('icon'),
      image_url: previewUrl || formData.get('image_url') // Use state if available (from upload), else input
    }

    try {
      const method = editingCategory ? 'PUT' : 'POST'
      const body = editingCategory ? { ...categoryData, id: editingCategory.id } : categoryData

      const res = await fetch('/api/admin/categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        setShowModal(false)
        setEditingCategory(null)
        fetchCategories()
      }
    } catch (error) {
      console.error('Failed to save category:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' })
        if (res.ok) {
          fetchCategories()
        }
      } catch (error) {
        console.error('Failed to delete category:', error)
      }
    }
  }

  return (
    <AdminLayout>
      <div className="text-white">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Category</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category: any) => (
            <div key={category.id} className="bg-secondary-900 rounded-lg shadow p-6">
              <img
                src={category.image_url}
                alt={category.name}
                className="w-full h-32 object-cover rounded mb-4"
              />
              <h3 className="text-lg font-semibold text-white mb-2">{category.name}</h3>
              <p className="text-sm text-secondary-400 mb-4">Slug: {category.slug}</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => { setEditingCategory(category); setShowModal(true) }}
                  className="flex-1 bg-primary-500 text-white py-2 px-4 rounded hover:bg-primary-600"
                >
                  <Edit className="h-4 w-4 mx-auto" />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mx-auto" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-secondary-900 rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-semibold text-white mb-4">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  name="name"
                  placeholder="Category Name"
                  defaultValue={editingCategory?.name || ''}
                  className="w-full p-2 border border-secondary-700 rounded bg-secondary-800 text-white"
                  required
                />
                <input
                  name="slug"
                  placeholder="Slug (e.g., home-essentials)"
                  defaultValue={editingCategory?.slug || ''}
                  className="w-full p-2 border border-secondary-700 rounded bg-secondary-800 text-white"
                  required
                />
                <input
                  name="icon"
                  placeholder="Icon Name (e.g., Home)"
                  defaultValue={editingCategory?.icon || ''}
                  className="w-full p-2 border border-secondary-700 rounded bg-secondary-800 text-white"
                />

                <div className="space-y-2">
                  <label className="block text-sm text-secondary-400">Category Image</label>

                  {/* Image Preview */}
                  {(previewUrl || editingCategory?.image_url) && (
                    <div className="relative w-full h-40 bg-secondary-800 rounded-lg overflow-hidden border border-secondary-700">
                      <img
                        src={previewUrl || editingCategory?.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewUrl('')
                          // If editing, clearing preview doesn't clear the saved URL until submit, 
                          // but effectively we want to allow replacing it.
                          // For valid form submission we'll rely on the input value or uploaded url
                        }}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* File Upload */}
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="flex-1 p-2 border border-secondary-700 rounded bg-secondary-800 text-white text-sm"
                      disabled={uploading}
                    />
                  </div>
                  {uploading && <p className="text-primary-400 text-sm">Uploading...</p>}

                  {/* URL Input Fallback */}
                  <input
                    name="image_url"
                    placeholder="Or paste Image URL"
                    defaultValue={editingCategory?.image_url || ''}
                    value={previewUrl || undefined}
                    onChange={(e) => setPreviewUrl(e.target.value)}
                    className="w-full p-2 border border-secondary-700 rounded bg-secondary-800 text-white"
                  />
                </div>

                <div className="flex space-x-2">
                  <button type="submit" className="bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600 flex-1" disabled={uploading}>
                    {editingCategory ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setEditingCategory(null); setPreviewUrl(''); }}
                    className="bg-secondary-700 text-white px-4 py-2 rounded hover:bg-secondary-800 flex-1"
                  >
                    Cancel
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