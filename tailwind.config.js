/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        'ear-left': 'earLeft 2s infinite',
        'ear-right': 'earRight 2s infinite',
      },
      keyframes: {
        earLeft: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '50%': { transform: 'rotate(-5deg)' }
        },
        earRight: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '50%': { transform: 'rotate(5deg)' }
        }
      },
      width: {
        'bunny-ear': 'clamp(100px, 40%, 150px)',
        'bunny-head': 'clamp(120px, 60%, 200px)',
      }
    },
  },
  plugins: [],
}; 