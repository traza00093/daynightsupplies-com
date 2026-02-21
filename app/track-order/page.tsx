'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Search, Package, Truck, CheckCircle, Clock, AlertCircle, Star } from 'lucide-react'
import ReviewModal from '@/components/ReviewModal'

interface Order {
  id: number
  order_number: string
  customer_name: string
  total_amount: number
  status: string
  tracking_number?: string
  created_at: string
  shipped_at?: string
  delivered_at?: string
  shipping_address: any
  items: Array<{
    product_name: string
    quantity: number
    price: number
    image_url: string
  }>
  statusHistory: Array<{
    status: string
    notes: string
    created_at: string
  }>
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setOrder(null)

    try {
      const response = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`)
      const data = await response.json()

      if (data.success) {
        setOrder(data.order)
      } else {
        setError(data.error || 'Order not found')
      }
    } catch (error) {
      setError('Failed to track order. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReviewSubmit = async (reviewData: any) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      if (response.ok) {
        alert('Thank you for your review! It will be reviewed and published shortly.');
      } else {
        const errorData = await response.json();
        alert(`Failed to submit review: ${errorData.error}`);
      }
    } catch (error) {
      alert('Failed to submit review. Please try again.');
    }
  }

  const openReviewModal = (product: any) => {
    setSelectedProduct(product);
    setShowReviewModal(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'processing':
        return <Package className="h-5 w-5 text-blue-500" />
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-500" />
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Package className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-100 mb-4">Track Your Order</h1>
            <p className="text-gray-300">Enter your order number and email to track your order status</p>
          </div>

          {/* Search Form */}
          <div className="bg-gray-800 rounded-lg shadow p-6 mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-300 mb-1">
                    Order Number
                  </label>
                  <input
                    type="text"
                    id="orderNumber"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="DN20241201-0001"
                    required
                    className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Search className="h-4 w-4" />
                <span>{isLoading ? 'Tracking...' : 'Track Order'}</span>
              </button>
            </form>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
          </div>

          {/* Order Details */}
          {order && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-100">Order {order.order_number}</h2>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-300">Order Date</p>
                    <p className="font-medium text-white">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Total Amount</p>
                    <p className="font-medium text-white">${order.total_amount.toFixed(2)}</p>
                  </div>
                  {order.tracking_number && (
                    <div>
                      <p className="text-sm text-gray-300">Tracking Number</p>
                      <p className="font-medium text-white">{order.tracking_number}</p>
                    </div>
                  )}
                </div>

                {/* Shipping Address */}
                <div className="border-t border-gray-700 pt-4">
                  <h3 className="font-medium text-gray-100 mb-2">Shipping Address</h3>
                  <p className="text-gray-300">
                    {order.customer_name}<br />
                    {order.shipping_address?.address}<br />
                    {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zipCode}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Order Items</h3>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 border-b border-gray-700 pb-4">
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="h-16 w-16 rounded-md object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-100">{item.product_name}</h4>
                        <p className="text-sm text-gray-300">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-100">${(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-sm text-gray-300">${item.price.toFixed(2)} each</p>
                        {order.status === 'delivered' && (
                          <button
                            onClick={() => openReviewModal(item)}
                            className="mt-2 text-sm bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded flex items-center"
                          >
                            <Star className="h-4 w-4 mr-1" />
                            Review
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status History */}
              <div className="bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Order Status History</h3>
                <div className="space-y-4">
                  {order.statusHistory.map((status, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      {getStatusIcon(status.status)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-100 capitalize">{status.status}</p>
                          <p className="text-sm text-gray-400">
                            {new Date(status.created_at).toLocaleString()}
                          </p>
                        </div>
                        {status.notes && (
                          <p className="text-sm text-gray-300 mt-1">{status.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
      {showReviewModal && selectedProduct && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onReviewSubmit={handleReviewSubmit}
          productName={selectedProduct.product_name}
          orderId={order?.order_number || ''}
        />
      )}
    </>
  )
}