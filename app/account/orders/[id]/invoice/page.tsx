'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Printer } from 'lucide-react'

interface Invoice {
  invoiceNumber: string
  orderNumber: string
  date: string
  company: {
    name: string
    address: string
    phone: string
    email: string
  }
  customer: {
    name: string
    email: string
    address: any
  }
  items: Array<{
    product_name: string
    quantity: number
    price: number
    total: number
  }>
  subtotal: number
  taxAmount: number
  shippingAmount: number
  discountAmount: number
  total: number
  paymentStatus: string
}

export default function InvoicePage() {
  const params = useParams()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInvoice()
  }, [params.id])

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}/invoice`)
      if (response.ok) {
        const data = await response.json()
        setInvoice(data)
      }
    } catch (error) {
      console.error('Failed to fetch invoice:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
        <Footer />
      </>
    )
  }

  if (!invoice) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Invoice not found</h1>
            <a href="/account/orders" className="text-blue-600 hover:text-blue-800">Back to Orders</a>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-center mb-8 print:hidden">
              <h1 className="text-2xl font-bold text-gray-900">Invoice</h1>
              <button
                onClick={() => window.print()}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </button>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">From:</h2>
                <div className="text-gray-600">
                  <p className="font-medium">{invoice.company.name}</p>
                  <p>{invoice.company.address}</p>
                  <p>{invoice.company.phone}</p>
                  <p>{invoice.company.email}</p>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">To:</h2>
                <div className="text-gray-600">
                  <p className="font-medium">{invoice.customer.name}</p>
                  <p>{invoice.customer.email}</p>
                  {invoice.customer.address && (
                    <>
                      <p>{invoice.customer.address.address}</p>
                      <p>{invoice.customer.address.city}, {invoice.customer.address.state} {invoice.customer.address.zipCode}</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <p><span className="font-medium">Invoice Number:</span> {invoice.invoiceNumber}</p>
                <p><span className="font-medium">Order Number:</span> {invoice.orderNumber}</p>
              </div>
              <div>
                <p><span className="font-medium">Date:</span> {invoice.date}</p>
                <p><span className="font-medium">Payment Status:</span> 
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    invoice.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {invoice.paymentStatus}
                  </span>
                </p>
              </div>
            </div>

            <div className="mb-8">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Item</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Quantity</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Price</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-4 py-2">{item.product_name}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">${item.price.toFixed(2)}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-2">
                  <span>Subtotal:</span>
                  <span>${invoice.subtotal.toFixed(2)}</span>
                </div>
                {invoice.discountAmount > 0 && (
                  <div className="flex justify-between py-2 text-red-600">
                    <span>Discount:</span>
                    <span>-${invoice.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {invoice.taxAmount > 0 && (
                  <div className="flex justify-between py-2">
                    <span>Tax:</span>
                    <span>${invoice.taxAmount.toFixed(2)}</span>
                  </div>
                )}
                {invoice.shippingAmount > 0 && (
                  <div className="flex justify-between py-2">
                    <span>Shipping:</span>
                    <span>${invoice.shippingAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 font-bold text-lg border-t border-gray-300">
                  <span>Total:</span>
                  <span>${invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}