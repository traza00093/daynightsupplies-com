'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Plus, Edit, Trash2, Eye, X } from 'lucide-react'

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  stock_quantity: number;
  category_id: string;
  image_url?: string;
  images?: string[];
  in_stock: boolean;
  category_name?: string;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image_url?: string;
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [productImages, setProductImages] = useState<string[]>([])

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  useEffect(() => {
    if (editingProduct) {
      if (editingProduct.images && Array.isArray(editingProduct.images) && editingProduct.images.length > 0) {
        setProductImages(editingProduct.images)
      } else if (editingProduct.image_url) {
        setProductImages([editingProduct.image_url])
      } else {
        setProductImages([])
      }
    } else {
      setProductImages([])
    }
  }, [editingProduct])

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

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products')
      const data = await res.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Failed to fetch products:', error)
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const remainingSlots = 3 - productImages.length
    if (remainingSlots <= 0) {
      setError('Maximum 3 images allowed')
      return
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots)

    setUploading(true)
    setError('')

    try {
      for (const file of filesToUpload) {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        const data = await res.json()

        if (!res.ok) throw new Error(data.error || 'Upload failed')

        setProductImages(prev => [...prev, data.url])
      }
    } catch (error: any) {
      console.error('Upload failed:', error)
      setError('Upload failed: ' + error.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleAddImageUrl = () => {
    if (!imageUrl) return
    if (productImages.length >= 3) {
      setError('Maximum 3 images allowed')
      return
    }
    setProductImages(prev => [...prev, imageUrl])
    setImageUrl('')
  }

  const handleRemoveImage = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    const formData = new FormData(e.target as HTMLFormElement)

    const productData = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price') as string),
      original_price: formData.get('original_price') ? parseFloat(formData.get('original_price') as string) : null,
      stock_quantity: parseInt(formData.get('stock_quantity') as string || '100'),
      category_id: formData.get('category_id') as string, // Keep as string for Firestore
      image_url: productImages.length > 0 ? productImages[0] : (imageUrl || formData.get('image_url')),
      images: productImages,
      in_stock: formData.get('in_stock') === 'on'
    }

    try {
      const method = editingProduct ? 'PUT' : 'POST'
      const body = editingProduct ? { ...productData, id: editingProduct.id } : productData

      const res = await fetch('/api/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()

      if (res.ok) {
        setShowModal(false)
        setEditingProduct(null)
        setImageUrl('')
        setError('')
        fetchProducts()
      } else {
        setError(data.error || 'Failed to save product')
      }
    } catch (error) {
      console.error('Failed to save product:', error)
      setError('Failed to save product. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' })
        if (res.ok) {
          fetchProducts()
        }
      } catch (error) {
        console.error('Failed to delete product:', error)
      }
    }
  }

  return (
    <AdminLayout>
      <div className="text-white">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </button>
        </div>

        <div className="bg-secondary-900 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-secondary-800">
            <thead className="bg-secondary-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-800">
              {products.map((product: any) => (
                <tr key={product.id} className="hover:bg-secondary-800">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img className="h-10 w-10 rounded object-cover" src={product.image_url} alt="" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{product.name}</div>
                        <div className="text-sm text-secondary-400">{product.description?.substring(0, 50)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white">{product.category_name}</td>
                  <td className="px-6 py-4 text-sm text-white">${product.price}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${product.in_stock ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'}`}>
                      {product.in_stock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium space-x-2">
                    <button
                      onClick={() => { setEditingProduct(product); setShowModal(true) }}
                      className="text-primary-400 hover:text-primary-300"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-secondary-900 rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-semibold text-secondary-100 mb-4">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-200 text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  name="name"
                  placeholder="Product Name"
                  defaultValue={editingProduct?.name || ''}
                  className="w-full p-2 border border-secondary-700 rounded bg-secondary-800 text-secondary-100"
                  required
                />
                <textarea
                  name="description"
                  placeholder="Description"
                  defaultValue={editingProduct?.description || ''}
                  className="w-full p-2 border border-secondary-700 rounded bg-secondary-800 text-secondary-100"
                  rows={3}
                />
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  defaultValue={editingProduct?.price || ''}
                  className="w-full p-2 border border-secondary-700 rounded bg-secondary-800 text-secondary-100"
                  required
                />
                <input
                  name="original_price"
                  type="number"
                  step="0.01"
                  placeholder="Original Price (optional)"
                  defaultValue={editingProduct?.original_price || ''}
                  className="w-full p-2 border border-secondary-700 rounded bg-secondary-800 text-secondary-100"
                />
                <input
                  name="stock_quantity"
                  type="number"
                  placeholder="Stock Quantity"
                  defaultValue={editingProduct?.stock_quantity ?? 100}
                  className="w-full p-2 border border-secondary-700 rounded bg-secondary-800 text-secondary-100"
                />
                <select
                  name="category_id"
                  defaultValue={editingProduct?.category_id || ''}
                  className="w-full p-2 border border-secondary-700 rounded bg-secondary-800 text-secondary-100"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <div className="space-y-2">
                  <label className="block text-sm text-secondary-300">Product Images (Max 3)</label>

                  {/* Image List */}
                  {productImages.length > 0 && (
                    <div className="flex gap-2 mb-2">
                      {productImages.map((img, index) => (
                        <div key={index} className="relative group">
                          <img src={img} alt={`Product ${index + 1}`} className="w-20 h-20 object-cover rounded border border-secondary-700" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {productImages.length < 3 && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="flex-1 p-2 border border-secondary-700 rounded bg-secondary-800 text-secondary-100 text-sm"
                        />
                        {uploading && <span className="text-primary-400 text-sm flex items-center">Uploading...</span>}
                      </div>
                      <div className="flex gap-2 items-start">
                        <div className="flex-1">
                          <input
                            name="image_input"
                            placeholder="Paste image URL..."
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="w-full p-2 border border-secondary-700 rounded bg-secondary-800 text-secondary-100 placeholder-secondary-500"
                          />
                          {imageUrl && (
                            <div className="mt-2 bg-secondary-950 rounded p-2 border border-secondary-800 inline-block">
                              <span className="text-xs text-secondary-400 block mb-1">Preview:</span>
                              <img
                                src={imageUrl}
                                alt="Preview"
                                className="h-24 w-auto max-w-full object-contain rounded"
                                onError={(e) => (e.currentTarget.style.display = 'none')}
                              />
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={handleAddImageUrl}
                          disabled={!imageUrl}
                          className="bg-secondary-700 px-4 py-2 rounded hover:bg-secondary-600 disabled:opacity-50 text-white h-[42px]"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <label className="flex items-center">
                  <input
                    name="in_stock"
                    type="checkbox"
                    defaultChecked={editingProduct?.in_stock !== false}
                    className="mr-2"
                  />
                  In Stock
                </label>
                <div className="flex space-x-2">
                  <button type="submit" className="btn-primary flex-1" disabled={saving}>
                    {saving ? 'Saving...' : (editingProduct ? 'Update' : 'Create')}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setEditingProduct(null); setImageUrl('') }}
                    className="btn-secondary flex-1"
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