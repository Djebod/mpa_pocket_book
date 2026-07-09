/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0B4A30",
        "ink-light": "#136B47",
        brass: "#009850",
        "brass-light": "#33B06E",
        paper: "#FFFFFF",
        "paper-dark": "#E7F3EC",
        card: "#FFFFFF",
        charcoal: "#1E2723",
        sage: "#2F855A",
        rust: "#C0392B",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-public-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      boxShadow: {
        stamp: "0 1px 0 rgba(11,74,48,0.06), 0 2px 6px rgba(11,74,48,0.10)",
      },
      backgroundImage: {
        grain:
          "radial-gradient(circle at 1px 1px, rgba(11,74,48,0.05) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};
