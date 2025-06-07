/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",      // Next.js pages folder
    "./components/**/*.{js,ts,jsx,tsx}", // components folder
    "./src/**/*.{js,ts,jsx,tsx}"         // If you put code in src folder
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
