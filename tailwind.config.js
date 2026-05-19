/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eef2ff", 100: "#e0e7ff", 200: "#c7d2fe",
          400: "#818cf8", 500: "#6366f1", 600: "#4f46e5",
          700: "#4338ca", 800: "#3730a3", 900: "#312e81",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
      animation: {
        "bounce-dot": "bounceDot 1.2s ease-in-out infinite",
        "fade-up":    "fadeUp 0.2s ease",
        "slide-in":   "slideIn 0.25s ease",
      },
      keyframes: {
        bounceDot: { "0%,80%,100%": { transform: "translateY(0)" }, "40%": { transform: "translateY(-6px)" } },
        fadeUp:    { from: { opacity: 0, transform: "translateY(6px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        slideIn:   { from: { opacity: 0, transform: "translateX(-8px)" }, to: { opacity: 1, transform: "translateX(0)" } },
      },
    },
  },
  plugins: [],
};