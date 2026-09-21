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
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Plus Jakarta Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
