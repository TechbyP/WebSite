/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: ['touch-pan-y', 'touch-none'], // Optional
  theme: {
    extend: {
      fontFamily: {
        sans: ['Gin', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brandblue: '#034f8b',
        brandgreen: '#72b944',
        brandorange: '#ff8200',
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
