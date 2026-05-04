/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        voice: {
          bg:      "#060d1c",
          surface: "#0d1b33",
          border:  "rgba(255,255,255,0.07)",
        },
      },
      animation: {
        "in":                    "fadeIn 0.2s ease-out",
        "slide-in-from-right-4": "slideInRight 0.3s ease-out",
        "spin-slow":             "spin 4s linear infinite",
        "ring":                  "ringPhone 1.5s ease-in-out infinite",
        "wave":                  "waveBar 0.6s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0, transform: "scale(0.95)" },
          to:   { opacity: 1, transform: "scale(1)"    },
        },
        slideInRight: {
          from: { opacity: 0, transform: "translateX(1rem)" },
          to:   { opacity: 1, transform: "translateX(0)"    },
        },
        ringPhone: {
          "0%,100%": { transform: "rotate(0deg)"   },
          "10%":     { transform: "rotate(15deg)"  },
          "20%":     { transform: "rotate(-13deg)" },
          "30%":     { transform: "rotate(10deg)"  },
          "40%":     { transform: "rotate(-8deg)"  },
          "50%":     { transform: "rotate(5deg)"   },
          "60%":     { transform: "rotate(-3deg)"  },
          "70%":     { transform: "rotate(0deg)"   },
        },
        waveBar: {
          "0%":   { transform: "scaleY(0.15)" },
          "100%": { transform: "scaleY(1)"    },
        },
      },
    },
  },
  plugins: [],
};
