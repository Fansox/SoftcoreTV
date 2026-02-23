import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        panel: "#111827",
        accent: "#22c55e",
        danger: "#ef4444",
        warning: "#f59e0b"
      }
    }
  },
  plugins: []
};

export default config;
