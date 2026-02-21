'use client'

import { useState } from 'react'
import { X, Plus, Minus, ShoppingBag, Tag, CheckCircle } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { validateCoupon } from '@/lib/coupon'

interface CartProps {
  isOpen: boolean
  onClose: () => void
}

export default function Cart({ isOpen, onClose }: CartProps) {
  const { state, dispatch } = useCart()
  const [couponCode, setCouponCode] = useState('')
  const [couponError, setCouponError] = useState('')
  const [isApplying, setIsApplying] = useState(false)
  const [isApplied, setIsApplied] = useState(false)

  const updateQuantity = (id: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  }

  const removeItem = (id: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code')
      return
    }

    setIsApplying(true)
    setCouponError('')

    try {
      const result = await validateCoupon(couponCode, state.items, state.total)

      if (result.valid && result.discount !== undefined && result.coupon) {
        // Apply the coupon to the cart
        dispatch({
          type: 'APPLY_COUPON',
          payload: {
            code: result.coupon.code,
            discount: result.discount,
            type: result.coupon.discount_type
          }
        })
        setIsApplied(true)
        setCouponCode('')
      } else {
        setCouponError(result.error || 'Invalid coupon code')
      }
    } catch (error) {
      setCouponError('An error occurred while applying the coupon')
      console.error('Error applying coupon:', error)
    } finally {
      setIsApplying(false)
    }
  }

  const removeCoupon = () => {
    dispatch({ type: 'REMOVE_COUPON' })
    setIsApplied(false)
    setCouponError('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-secondary-950 shadow-2xl border-l border-secondary-900">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-secondary-800 px-6 py-5 bg-secondary-900/50">
            <h2 className="text-xl font-serif font-bold text-white tracking-wide">Shopping Cart</h2>
            <button onClick={onClose} className="text-secondary-400 hover:text-white transition-colors p-1 hover:bg-secondary-800 rounded-full">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-secondary-700 scrollbar-track-secondary-900">
            {state.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-secondary-500">
                <ShoppingBag className="h-16 w-16 mb-4 text-secondary-700" />
                <p className="text-lg">Your cart is empty</p>
                <button onClick={onClose} className="mt-4 text-primary-400 hover:text-primary-300 font-medium">
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {state.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 border-b border-secondary-800 pb-6 group">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-20 w-20 rounded-md object-cover border border-secondary-800"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium text-white truncate pr-4">{item.name}</h3>
                      <p className="text-sm text-primary-400 mb-2">${typeof item.price === 'number' ? item.price.toFixed(2) : parseFloat(item.price).toFixed(2)}</p>

                      <div className="flex items-center space-x-3">
                        <div className="flex items-center bg-secondary-900 rounded-lg border border-secondary-800">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 text-secondary-400 hover:text-white transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 text-sm text-white font-medium min-w-[1.5rem] text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 text-secondary-400 hover:text-white transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-red-500 hover:text-red-400 underline decoration-red-500/30 hover:decoration-red-400 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="text-base font-bold text-white">
                      ${((typeof item.price === 'number' ? item.price : parseFloat(item.price)) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {state.items.length > 0 && (
            <div className="bg-secondary-900 border-t border-secondary-800 px-6 py-6 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
              {/* Coupon Input */}
              <div className="mb-6">
                <div className="flex shadow-sm">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="flex-1 bg-secondary-950 border border-secondary-700 rounded-l-md px-4 py-2.5 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-white placeholder-secondary-600 text-sm transition-colors"
                    disabled={isApplying || isApplied}
                  />
                  {isApplied ? (
                    <button
                      onClick={removeCoupon}
                      className="bg-secondary-700 text-secondary-200 px-4 py-2 rounded-r-md hover:bg-secondary-600 transition-colors flex items-center border border-l-0 border-secondary-700"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={applyCoupon}
                      disabled={isApplying}
                      className="bg-secondary-800 text-white px-5 py-2 rounded-r-md hover:bg-secondary-700 hover:text-primary-400 transition-colors disabled:opacity-50 border border-l-0 border-secondary-700 font-medium text-sm"
                    >
                      {isApplying ? 'Applying...' : 'Apply'}
                    </button>
                  )}
                </div>
                {couponError && (
                  <p className="text-red-400 text-xs mt-2 pl-1 flex items-center"><X className="h-3 w-3 mr-1" /> {couponError}</p>
                )}
                {isApplied && state.couponCode && (
                  <div className="mt-2 flex items-center text-green-400 text-sm pl-1">
                    <CheckCircle className="h-3 w-3 mr-1.5" />
                    <span>Coupon <strong>{state.couponCode}</strong> applied successfully</span>
                  </div>
                )}
              </div>

              {/* Price Summary */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-secondary-300">
                  <p>Subtotal</p>
                  <p className="font-medium text-white">${state.total.toFixed(2)}</p>
                </div>

                {state.discountAmount > 0 && state.couponCode && (
                  <div className="flex justify-between text-secondary-300">
                    <p className="flex items-center"><Tag className="w-3 h-3 mr-1.5" /> Coupon ({state.couponCode})</p>
                    <p className="text-green-400">-${state.discountAmount.toFixed(2)}</p>
                  </div>
                )}

                <div className="flex justify-between text-lg font-bold text-white pt-4 border-t border-secondary-800">
                  <p>Total</p>
                  <p className="text-primary-400">${state.discountedTotal.toFixed(2)}</p>
                </div>
              </div>

              <a
                href="/checkout"
                className="w-full bg-primary-500 text-white py-3.5 px-4 rounded-lg hover:bg-primary-600 transition-all text-center block font-bold uppercase tracking-wider shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transform hover:-translate-y-0.5"
                onClick={(e) => {
                  if (!state.items.length) {
                    e.preventDefault();
                    return;
                  }
                  if (state.couponCode) {
                    e.preventDefault();
                    const encodedCoupon = encodeURIComponent(JSON.stringify({
                      code: state.couponCode,
                      discountAmount: state.discountAmount
                    }));
                    window.location.href = `/checkout?coupon=${encodedCoupon}`;
                    onClose();
                  }
                  // Default link behavior handles logic otherwise
                }}
              >
                Proceed to Checkout
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}