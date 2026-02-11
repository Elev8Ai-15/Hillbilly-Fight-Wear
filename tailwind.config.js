/** @type {import('tailwindcss').Config} */
module.exports = {
  // Scan the server-rendered template literals in index.tsx for Tailwind class usage
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
