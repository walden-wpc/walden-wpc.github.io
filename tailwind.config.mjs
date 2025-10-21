/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#121212',
        surface: '#1E1E1E',
        accent: '#8CEA00',
        'text-primary': '#FFFFFF',
        'text-secondary': '#A0A0A0',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
export default config;
