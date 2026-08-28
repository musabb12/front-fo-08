import type { Config } from "tailwindcss";

// Design tokens for the "Blueprint" system — see README.md § Design tokens.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#0D1F33",       // page background — blueprint navy
        "canvas-raised": "#14283F", // card / panel background
        "canvas-deep": "#091828",   // slightly darker than canvas — recessed cards
        grid: "#24405E",         // hairlines, borders, dashed grid strokes
        paper: "#EAF1FB",        // primary text on dark canvas
        muted: "#93A8C4",        // secondary text
        amber: "#F2B134",        // single signature accent — annotation ink
      },
      fontFamily: {
        display: ["var(--font-cairo)", "sans-serif"],
        body: ["var(--font-plex-arabic)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      backgroundImage: {
        "blueprint-grid":
          "linear-gradient(rgba(36,64,94,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(36,64,94,0.35) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid-24": "24px 24px",
      },
    },
  },
  plugins: [],
};
export default config;
