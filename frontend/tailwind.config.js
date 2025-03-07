/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
    "./public/**/*.html"
  ],
  theme: {
    extend: {
      colors: {
        'council-blue': {
          DEFAULT: '#003366',
          '50': '#e6f0ff',
          '100': '#bad6ff',
          '200': '#8cbeff',
          '300': '#5ca5ff',
          '400': '#2c8cff',
          '500': '#0073e6',
          '600': '#005fb3',
          '700': '#004b87',
          '800': '#003366',
          '900': '#001a33'
        }
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}
