'use client'

import { useState } from 'react'
import { Filter, X, Minus, Plus } from 'lucide-react'

interface FilterOption {
  id: string
  name: string
  value: string
  count?: number
}

interface FilterSection {
  id: string
  title: string
  options: FilterOption[]
  type: 'checkbox' | 'range' | 'radio'
  currentValue?: string | string[]
  onFilterChange: (value: string | string[]) => void
}

interface SidebarFilterProps {
  sections: FilterSection[]
  activeFilters: Record<string, string | string[]>
  onFilterChange?: (sectionId: string, value: string | string[]) => void
  onClearAll?: () => void
}

export default function SidebarFilter({ 
  sections, 
  activeFilters, 
  onFilterChange, 
  onClearAll 
}: SidebarFilterProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const clearSection = (sectionId: string) => {
    if (onFilterChange) {
      onFilterChange(sectionId, sectionId === 'price' ? ['0', '1000'] : []) // Reset to default
    }
  }

  const isActiveFilter = (sectionId: string, optionValue: string) => {
    const filterValue = activeFilters[sectionId]
    if (Array.isArray(filterValue)) {
      return filterValue.includes(optionValue)
    }
    return filterValue === optionValue
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 h-fit">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Filter className="mr-2 h-5 w-5" />
          Filters
        </h3>
        <button
          onClick={onClearAll}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection(section.id)}
            >
              <h4 className="font-medium text-gray-900">{section.title}</h4>
              <button type="button">
                {expandedSections[section.id] ? (
                  <Minus className="h-4 w-4 text-gray-500" />
                ) : (
                  <Plus className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>

            {expandedSections[section.id] && (
              <div className="mt-3 space-y-2">
                {section.options.map((option) => {
                  const isActive = isActiveFilter(section.id, option.value)
                  return (
                    <div key={option.id} className="flex items-center">
                      <input
                        type={section.type === 'checkbox' ? 'checkbox' : 'radio'}
                        id={option.id}
                        checked={isActive}
                        onChange={() => {
                          if (section.type === 'checkbox') {
                            const currentValue = activeFilters[section.id] as string[] || []
                            const newValue = isActive
                              ? currentValue.filter(v => v !== option.value)
                              : [...currentValue, option.value]
                            if (onFilterChange) onFilterChange(section.id, newValue)
                          } else {
                            if (onFilterChange) onFilterChange(section.id, option.value)
                          }
                        }}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label 
                        htmlFor={option.id} 
                        className={`ml-2 block text-sm ${isActive ? 'font-medium text-blue-600' : 'text-gray-700'}`}
                      >
                        {option.name}
                        {option.count !== undefined && (
                          <span className="ml-1 text-gray-500">({option.count})</span>
                        )}
                      </label>
                    </div>
                  )
                })}
              </div>
            )}

            {activeFilters[section.id] && 
              Array.isArray(activeFilters[section.id]) && 
              (activeFilters[section.id] as string[]).length > 0 && (
              <button
                onClick={() => clearSection(section.id)}
                className="mt-2 text-xs text-red-600 hover:text-red-800 flex items-center"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}