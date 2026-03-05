import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        jade: {
          DEFAULT: "#0D1F17",
          50: "#1a3d2a",
          100: "#163324",
          200: "#12291e",
          300: "#0D1F17",
          400: "#091610",
          500: "#11d483",
          600: "#0ea86a",
        },
        gold: {
          DEFAULT: "#C9A84C",
          light: "#f0d080",
          dark: "#a8883a",
        },
        cream: {
          DEFAULT: "#F5ECD7",
          muted: "#8B8579",
        },
        surface: {
          DEFAULT: "#162A1F",
          raised: "#1E3829",
        },
        green: {
          DEFAULT: "#22C55E",
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
        },
        yellow: {
          DEFAULT: "#EAB308",
          500: "#EAB308",
        },
        red: {
          DEFAULT: "#EF4444",
          500: "#EF4444",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)",
        "card-hover": "0 12px 48px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3)",
        glow: "0 0 40px rgba(201,168,76,0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
