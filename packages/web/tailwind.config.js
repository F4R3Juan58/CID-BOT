/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        discord: {
          bg: '#1a1b1e',
          sidebar: '#1e1f22',
          card: '#2b2d31',
          hover: '#35373c',
          text: '#dbdee1',
          muted: '#949ba4',
          primary: '#5865f2',
          success: '#57f287',
          danger: '#ed4245',
          warning: '#fee75c',
        },
      },
    },
  },
  plugins: [],
};
