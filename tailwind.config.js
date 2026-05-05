/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 15px rgba(52, 211, 153, 0.35)',
        'neon-cyan': '0 0 18px rgba(34, 211, 238, 0.35)',
      },
    },
  },
  plugins: [],
};
