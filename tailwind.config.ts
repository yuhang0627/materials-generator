import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        blush: "#F7E9EC",
        cream: "#FFF9F3",
        mint: "#DDEFE5",
        sage: "#A9C2B4",
        ink: "#435058",
        peach: "#F4D6C2",
        lilac: "#E7E0F4"
      },
      boxShadow: {
        soft: "0 24px 60px rgba(86, 98, 112, 0.14)"
      },
      fontFamily: {
        body: ["Avenir Next", "Trebuchet MS", "Verdana", "sans-serif"],
        display: ["Avenir Next", "Gill Sans", "Trebuchet MS", "sans-serif"]
      },
      backgroundImage: {
        "gentle-radial":
          "radial-gradient(circle at top, rgba(255,255,255,0.9), rgba(255,249,243,0.65) 45%, rgba(247,233,236,0.55) 100%)"
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        drift: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -10px, 0)" }
        }
      },
      animation: {
        "fade-up": "fadeUp 0.7s ease-out both",
        drift: "drift 7s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
