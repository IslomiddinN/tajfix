import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2563EB'
        }
      },
      fontFamily: {
        sans: ['Rubik', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Helvetica Neue', 'Arial']
      },
      boxShadow: {
        card: '0 25px 50px -25px rgba(15, 23, 42, 0.35)'
      }
    }
  },
  plugins: []
};

export default config;
