// NY State tax rates by county
const NY_TAX_RATES: { [key: string]: number } = {
  'nassau': 0.0825, // Nassau County (Long Island)
  'suffolk': 0.0825, // Suffolk County (Long Island)
  'new york': 0.08375, // Manhattan
  'kings': 0.08375, // Brooklyn
  'queens': 0.08375, // Queens
  'bronx': 0.08375, // Bronx
  'richmond': 0.08375, // Staten Island
  'westchester': 0.08375,
  'default': 0.08 // NY State base rate
};

export function calculateTax(subtotal: number, state: string, city?: string): number {
  if (state.toLowerCase() !== 'ny' && state.toLowerCase() !== 'new york') {
    return 0; // No tax for out-of-state orders
  }

  const county = city?.toLowerCase() || 'default';
  const taxRate = NY_TAX_RATES[county] || NY_TAX_RATES.default;
  
  return Math.round(subtotal * taxRate * 100) / 100;
}

export function calculateShipping(subtotal: number, state: string): number {
  if (subtotal >= 50) return 0; // Free shipping over $50
  
  if (state.toLowerCase() === 'ny' || state.toLowerCase() === 'new york') {
    return 5.99; // Local NY shipping
  }
  
  return 9.99; // Standard shipping
}