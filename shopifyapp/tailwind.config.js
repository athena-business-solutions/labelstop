/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        shopify: {
          green: "#008060",
          "green-hover": "#006e52",
          bg: "#f6f6f7",
          sidebar: "#1a1a2e",
          card: "#ffffff",
          primary: "#202223",
          secondary: "#6d7175",
          border: "#e1e3e5",
          red: "#d72c0d",
          yellow: "#ffc453",
          blue: "#006fbb",
        },
      },
      boxShadow: {
        shopify: "0 1px 3px rgba(0,0,0,0.1)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
