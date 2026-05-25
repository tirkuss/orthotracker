/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#F8F9F8',
          DEFAULT: '#6B8E7D', // Sage Medical Green
          dark: '#4F6B5D'
        },
        accent: '#1A1A1A'
      },
      borderRadius: {
        '3xl': '2rem',
        '4xl': '2.5rem'
      }
    }
  },
  plugins: []
}