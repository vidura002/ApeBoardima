/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0F172A',
        navy: '#14213D',
        'soft-gray': '#F8FAFC',
        'border-gray': '#E5E7EB',
        'dark-text': '#0B1220',
        'mid-text': '#475569',
        'light-text': '#94A3B8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 4px rgba(15,23,42,0.05), 0 4px 20px rgba(15,23,42,0.06)',
        'card-hover': '0 8px 32px rgba(15,23,42,0.12)',
        soft: '0 2px 8px rgba(0,0,0,0.06)',
        header: '0 1px 0 #E5E7EB',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        shimmer: 'shimmer 1.8s infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
    },
  },
  plugins: [],
}
