/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2F6BFF',
        'primary-light': '#00C2FF',
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
        'page-bg': '#F5F7FA',
        'card-bg': '#FFFFFF',
        'dark-bg': '#0F172A',
      },
      borderRadius: {
        'card': '12px',
        'btn': '8px',
      },
      boxShadow: {
        'card': '0 4px 12px rgba(0,0,0,0.08)',
      },
      width: {
        'sidebar': '220px',
      },
      height: {
        'topbar': '64px',
      },
    },
  },
  plugins: [],
}
