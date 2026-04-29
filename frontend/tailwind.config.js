/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-primary": "#0f0f1e",
        "bg-secondary": "#1a1a2e",
        "bg-tertiary": "#16213e",
      },
    },
  },
  plugins: [],
}
