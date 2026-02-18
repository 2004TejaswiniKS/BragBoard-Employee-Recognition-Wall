/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5fbff',
          100: '#eaf7ff',
          200: '#cfeeff',
          300: '#a9e0ff',
          400: '#6fc3ff',
          500: '#1976d2', // primary button color
          600: '#155fb0',
          700: '#124a89',
          800: '#0d3560',
          900: '#081f38',
        }
      },
      borderRadius: {
        'xl': '1rem'
      }
    }
  },
  plugins: [],
};
