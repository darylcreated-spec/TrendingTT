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
        tt: {
          red: '#CE1126',
          darkRed: '#990011',
          black: '#0A0A0B',
          charcoal: '#17171C',
          white: '#FFFFFF',
          gold: '#F59E0B',
        },
        source: {
          ttt: '#15803D',
          cnc3: '#2563EB',
          tv6: '#BE123C',
          newsday: '#0284C7',
          express: '#475569',
          guardian: '#D97706',
          tiktok: '#000000',
          facebook: '#1877F2',
          instagram: '#E1306C',
        }
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
