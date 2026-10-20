/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Modern Indian SaaS Dashboard Palette
        canvas: {
          DEFAULT: "#F7F8FC",
          subtle: "#F0F4FA",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          soft: "#EAF2FF",
          tint: "#F2F6FD",
        },
        saffron: {
          DEFAULT: "#F28C28",
          hover: "#E07D1B",
          dark: "#C4650E",
          light: "#FFF7ED",
          border: "#FDD8B3",
        },
        navy: {
          DEFAULT: "#17243A",
          900: "#111C2E",
          800: "#17243A",
          700: "#23334D",
          600: "#344663",
          500: "#4D607E",
        },
        slate: {
          DEFAULT: "#66758A",
          600: "#66758A",
          500: "#7A899E",
          400: "#96A4B7",
          300: "#B8C4D4",
          200: "#D7DFEB",
          100: "#EAEFF6",
        },
        teal: {
          DEFAULT: "#159B82",
          hover: "#11826D",
          light: "#E8F7F4",
          border: "#B7E8DF",
        },
        coral: {
          DEFAULT: "#E84D62",
          hover: "#D63B51",
          light: "#FDF0F2",
          border: "#FAC7CF",
        },
        borderSoft: {
          DEFAULT: "#E4EAF3",
          light: "#EBF0F7",
        },
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
        subtle: "0 1px 3px 0 rgba(23, 36, 58, 0.04), 0 1px 2px -1px rgba(23, 36, 58, 0.03)",
        card: "0 2px 8px -2px rgba(23, 36, 58, 0.06), 0 1px 4px -1px rgba(23, 36, 58, 0.04)",
        hover: "0 12px 24px -4px rgba(23, 36, 58, 0.08), 0 4px 8px -2px rgba(23, 36, 58, 0.04)",
        floating: "0 16px 36px -6px rgba(23, 36, 58, 0.12), 0 6px 14px -3px rgba(23, 36, 58, 0.06)",
      },
    },
  },
  plugins: [],
};
