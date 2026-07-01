import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 18px 50px rgba(15, 23, 42, 0.08)",
        card: "0 10px 30px rgba(15, 23, 42, 0.06)",
        glow: "0 24px 80px rgba(37, 99, 235, 0.28)"
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-16px)" } },
        shimmer: { "0%": { transform: "translateX(-100%)" }, "100%": { transform: "translateX(100%)" } },
        spinWheel: { "0%": { transform: "rotate(0deg)" }, "80%": { transform: "rotate(1480deg)" }, "100%": { transform: "rotate(1440deg)" } },
        pulseSoft: { "0%,100%": { opacity: "0.65" }, "50%": { opacity: "1" } }
      },
      animation: {
        float: "float 4.5s ease-in-out infinite",
        shimmer: "shimmer 2.6s linear infinite",
        spinWheel: "spinWheel 2.2s cubic-bezier(.12,.88,.22,1) forwards",
        pulseSoft: "pulseSoft 2.8s ease-in-out infinite"
      }
    }
  },
  plugins: []
};
export default config;
