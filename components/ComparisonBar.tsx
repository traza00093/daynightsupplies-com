'use client'

import { useState } from 'react'
import { useComparison } from '@/contexts/ComparisonContext'
import { X, MinusCircle, ExternalLink } from 'lucide-react'

interface ComparisonBarProps {
  isOpen: boolean
  onClose: () => void
}

export default function ComparisonBar({ isOpen, onClose }: ComparisonBarProps) {
  const { state, dispatch } = useComparison()
  
  if (!isOpen || state.items.length === 0) return null

  const handleRemoveItem = (productId: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId })
  }

  const navigateToCompare = () => {
    const productIds = state.items.map(item => item.id).join(',')
    window.location.href = `/compare?ids=${productIds}`
    onClose()
  }

  return (
    <div className="fixed top-16 left-0 right-0 z-50 bg-blue-50 border-b border-blue-200 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="font-medium text-blue-900 mr-4">Comparison ({state.items.length}/4):</span>
            <div className="flex flex-wrap gap-2">
              {state.items.map(item => (
                <div 
                  key={item.id} 
                  className="flex items-center bg-white border border-blue-200 rounded-full px-3 py-1 text-sm"
                >
                  <span className="truncate max-w-[120px]">{item.name}</span>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={navigateToCompare}
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
            >
              View Comparison
              <ExternalLink className="ml-1 h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}