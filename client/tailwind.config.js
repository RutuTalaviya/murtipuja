/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          DEFAULT: "#000000",
          dark: "#111111",
        },
        gold: {
          DEFAULT: "#FF5500",
          light: "#FF7733",
        },
        ivory: "#FFFFFF",
        charcoal: "#000000",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "'Space Grotesk'", "sans-serif"],
        body: ["var(--font-plus-jakarta)", "'Plus Jakarta Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
