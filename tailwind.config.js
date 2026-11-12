const config = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./lib/**/*.{js,jsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" },
      screens: { "2xl": "1320px" },
    },
    extend: {
      colors: {
        ink: { DEFAULT: "#121212", soft: "#4a4a4a", muted: "#7a7a7a" },
        brand: { DEFAULT: "#E31C79", dark: "#C21466", light: "#FCE4EF" },
        coral: "#FF6464",
        mint: { DEFAULT: "#2BBEA1", light: "#E3F6F1" },
        cream: { DEFAULT: "#FFF7F2", dark: "#F8EBE1" },
        blush: "#FDEEF3",
        peach: "#FFEFE3",
        lilac: "#F1ECFB",
        mist: "#EEEEEE",
        line: "#ECE7E3",
      },
      fontFamily: {
        heading: ["var(--font-jost)", "system-ui", "sans-serif"],
        body: ["var(--font-jost)", "system-ui", "sans-serif"],
        accent: ["var(--font-montserrat)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 10px 30px -12px rgba(18, 18, 18, 0.15)",
        soft: "0 4px 18px rgba(18, 18, 18, 0.06)",
      },
      keyframes: {
        "fade-up": { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "none" } },
        "slide-in": { from: { transform: "translateX(100%)" }, to: { transform: "none" } },
        "slide-in-left": { from: { transform: "translateX(-100%)" }, to: { transform: "none" } },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
      },
      animation: {
        "fade-up": "fade-up .6s ease both",
        "slide-in": "slide-in .3s ease both",
        "slide-in-left": "slide-in-left .3s ease both",
        "fade-in": "fade-in .2s ease both",
      },
    },
  },
  plugins: [],
};
export default config;
