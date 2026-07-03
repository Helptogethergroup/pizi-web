import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      colors: {
        cream: {
          DEFAULT: '#fefcf6',
          dark: '#f4efe6',
        },
        ink: {
          50: '#f5f7fa',
          100: '#ebeff4',
          200: '#d7dee8',
          300: '#bcc6d5',
          500: '#7c8ea5',
          700: '#475f80',
          800: '#15355f',
          900: '#0f2748',
          950: '#0a1a30',
        },
        coral: {
          50:  '#fff2f0',
          100: '#ffe1dc',
          200: '#ffc0b6',
          300: '#ff9a8a',
          400: '#ff8a7c',
          500: '#ff6b5b',
          600: '#ed4e3d',
          700: '#c93215',
          900: '#861f0c',
        },
      },
    },
  },
  plugins: [],
};

export default config;
