/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/views/**/*.ejs"],
  theme: {
    extend: {
      colors: {
        primary: '#0f172a',    // Deep Navy
        secondary: '#0d9488',  // Emerald Green
        accent: '#38bdf8',     // Sky Blue
        surface: '#f8f9ff',
        'surface-container': '#ffffff',
        outline: '#e2e8f0',
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
      },
      borderRadius: {
        'card': '12px',
      }
    },
  },
  plugins: [],
}
