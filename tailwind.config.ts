import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#e6ebff',
          200: '#c4ccff',
          300: '#9fa9ff',
          400: '#7b86ff',
          500: '#5562ff',
          600: '#3a46db',
          700: '#2c35a8',
          800: '#1f2676',
          900: '#111646'
        }
      }
    }
  },
  plugins: []
};

export default config;
