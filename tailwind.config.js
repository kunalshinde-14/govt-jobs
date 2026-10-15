/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: "#FAF8F3",
          50: "#FCFAF7",
          100: "#FAF8F3",
          200: "#F5F2EA",
          300: "#E8E5DE",
        },
        saffron: {
          DEFAULT: "#F28C00",
          hover: "#D97706",
          dark: "#B45309",
          light: "#FFF8ED",
          border: "#FDE0B2",
        },
        charcoal: {
          DEFAULT: "#202521",
          900: "#202521",
          700: "#3D443F",
          500: "#737873",
          400: "#9BA09B",
          300: "#C4C8C3",
          100: "#F0F2EF",
        },
        borderLight: "#E8E5DE",
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          '"Inter"',
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(32, 37, 33, 0.03)",
        card: "0 1px 4px 0 rgba(32, 37, 33, 0.05), 0 1px 2px -1px rgba(32, 37, 33, 0.04)",
        hover: "0 8px 16px -2px rgba(32, 37, 33, 0.07), 0 2px 4px -2px rgba(32, 37, 33, 0.04)",
      },
    },
  },
  plugins: [],
};