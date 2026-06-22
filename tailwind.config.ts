import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6faf7',
          100: '#b3f0e7',
          200: '#80e6d7',
          300: '#4ddcc7',
          400: '#1ad2b7',
          500: '#00C9B1',
          600: '#00a895',
          700: '#008779',
          800: '#00665c',
          900: '#004540',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
