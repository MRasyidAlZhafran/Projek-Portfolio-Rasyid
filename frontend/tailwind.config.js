/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
          primary: "#00f0ff",
          secondary: "#7000ff",
          surface: "#050505",
          surfaceLight: "#121212",
          surfaceBorder: "#1e1e1e",
          textMain: "#ffffff",
          textMuted: "#888888"
      },
      fontFamily: {
          display: ["Hanken Grotesk", "sans-serif"],
          body: ["Inter", "sans-serif"],
          mono: ["Geist", "monospace"]
      },
      animation: {
          'float-slow': 'float 8s ease-in-out infinite',
          'float-fast': 'float 4s ease-in-out infinite',
          'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
          'grid-move': 'gridMove 20s linear infinite',
      },
      keyframes: {
          float: {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-20px)' },
          },
          pulseGlow: {
              '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
              '50%': { opacity: '1', transform: 'scale(1.05)' },
          },
          gridMove: {
              '0%': { transform: 'translateY(0)' },
              '100%': { transform: 'translateY(50px)' },
          }
      }
    },
  },
  plugins: [],
}
