/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#1B4332',
          600: '#163a2b',
          700: '#112e22',
          800: '#0d2419',
          900: '#091a11',
        },
        gold: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#C9A84C',
          500: '#B8943F',
          600: '#a07d33',
          700: '#7c6128',
          800: '#5c481e',
          900: '#3d3014',
        },
        cream: {
          50: '#FFFDF7',
          100: '#FDF8EE',
          200: '#F5F0E8',
          300: '#EDE5D8',
          400: '#DDD3C0',
          500: '#C4B59D',
        },
        espresso: {
          50: '#faf5f0',
          100: '#f0e4d6',
          200: '#dfc6a8',
          300: '#c9a77a',
          400: '#8B5E3C',
          500: '#3E2723',
          600: '#35211d',
          700: '#2b1a17',
          800: '#211411',
          900: '#170d0b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #40916C 100%)',
        'gold-gradient': 'linear-gradient(135deg, #C9A84C 0%, #E8D48B 50%, #C9A84C 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0d2419 0%, #1B4332 100%)',
      },
      boxShadow: {
        'tea': '0 4px 20px rgba(27, 67, 50, 0.15)',
        'gold': '0 4px 20px rgba(201, 168, 76, 0.2)',
        'card': '0 2px 15px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}
