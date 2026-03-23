import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0F",
        foreground: "#E5E7EB",
        card: {
          DEFAULT: "#12121A",
          foreground: "#E5E7EB",
        },
        accent: {
          DEFAULT: "#00FF88",
          foreground: "#0A0A0F",
          muted: "#00FF8833",
        },
        muted: {
          DEFAULT: "#1A1A25",
          foreground: "#9CA3AF",
        },
        border: "#1F1F2E",
        input: "#1F1F2E",
        ring: "#00FF88",
        destructive: {
          DEFAULT: "#FF4444",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#FFB800",
          foreground: "#0A0A0F",
        },
        success: {
          DEFAULT: "#00FF88",
          foreground: "#0A0A0F",
        },
        // Trading-specific
        long: "#00FF88",
        short: "#FF4444",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 5px #00FF8833" },
          "50%": { boxShadow: "0 0 20px #00FF8866" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
