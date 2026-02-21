'use client'

import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react'

interface ProductComparison {
  id: number
  name: string
  price: number
  image_url: string
}

interface ComparisonState {
  items: ProductComparison[]
  maxItems: number
}

type ComparisonAction = 
  | { type: 'ADD_ITEM'; payload: ProductComparison }
  | { type: 'REMOVE_ITEM'; payload: number }
  | { type: 'CLEAR_ALL' }

const ComparisonContext = createContext<{
  state: ComparisonState
  dispatch: React.Dispatch<ComparisonAction>
} | null>(null)

function comparisonReducer(state: ComparisonState, action: ComparisonAction): ComparisonState {
  switch (action.type) {
    case 'ADD_ITEM': {
      // Check if product is already in comparison list
      if (state.items.some(item => item.id === action.payload.id)) {
        return state; // Don't add duplicates
      }
      
      if (state.items.length >= state.maxItems) {
        // Remove the first item to maintain max items
        const newItems = [...state.items.slice(1), action.payload];
        return { ...state, items: newItems };
      }
      
      return { ...state, items: [...state.items, action.payload] };
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      return { ...state, items: newItems };
    }
    
    case 'CLEAR_ALL':
      return { ...state, items: [] };
    
    default:
      return state;
  }
}

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(comparisonReducer, {
    items: [],
    maxItems: 4
  })

  // Load comparison from localStorage on mount
  useEffect(() => {
    const savedComparison = localStorage.getItem('open-store-comparison');
    if (savedComparison) {
      const comparisonData = JSON.parse(savedComparison);
      comparisonData.items.forEach((item: ProductComparison) => {
        dispatch({ type: 'ADD_ITEM', payload: item });
      });
    }
  }, []);

  // Save comparison to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('open-store-comparison', JSON.stringify(state));
  }, [state]);

  return (
    <ComparisonContext.Provider value={{ state, dispatch }}>
      {children}
    </ComparisonContext.Provider>
  )
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
}