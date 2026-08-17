/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#09080e',
          800: '#110f1a',
          700: '#1a1726',
          600: '#252136',
          500: '#342f4b',
        },
        brand: {
          purple: '#9333ea',
          pink: '#ec4899',
          violet: '#a855f7',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
