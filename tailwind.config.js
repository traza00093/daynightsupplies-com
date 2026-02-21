/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Rose Gold - Primary accent color
        primary: {
          50: '#fdf8f6',
          100: '#f8ebe8',
          200: '#f2d7d0',
          300: '#e8b9ae',
          400: '#dc9589',
          500: '#c97864', // Main rose gold
          600: '#b35d4a',
          700: '#954a3d',
          800: '#7d4036',
          900: '#683931',
          950: '#371b17',
        },
        // Blush/Mauve - Soft accents
        accent: {
          50: '#faf7f5',
          100: '#f5ece8',
          200: '#ead9d1',
          300: '#dbbfb3',
          400: '#c9a091',
          500: '#b88274',
          600: '#a66e61',
          700: '#8a5a51',
          800: '#724c46',
          900: '#5f413d',
          950: '#32211e',
        },
        // Charcoal/Slate - Text and dark elements
        secondary: {
          50: '#fbf9f7',
          100: '#f5f0eb',
          200: '#ede1d8',
          300: '#e5cfc1', // User Requested Color (moved to 300 to allow darker contrast for text)
          400: '#d5bba8',
          500: '#c2a590',
          600: '#a88874',
          700: '#8c6d5b',
          800: '#715647',
          900: '#584237',
          950: '#3a2b23',
        },
        // Soft backgrounds
        cream: {
          50: '#fdfdfb',
          100: '#faf9f6',
          200: '#f5f3ed',
          300: '#ebe8df',
          400: '#ddd8ca',
          500: '#cbc4b1',
          600: '#b5ab93',
          700: '#968d76',
          800: '#7d7562',
          900: '#686154',
          950: '#37332b',
        }
      },
    },
  },
  plugins: [],
}