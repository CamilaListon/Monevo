import forms from "@tailwindcss/forms";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        forest: "#083C35",
        teal: "#0A7C78",
        coral: "#F26A3D",
        canvas: "#F2F4ED",
        ink: "#10201D",
        muted: "#5F6D68",
        "dark-canvas": "#0D1713",
        "dark-surface": "#17251E",
        "dark-raised": "#14211B",
        "dark-border": "#2B3D34",
        "dark-muted": "#A5B5AC",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Poppins", "sans-serif"],
      },
      fontSize: {
        xs: ["0.8125rem", { lineHeight: "1.25rem" }],
        sm: ["0.9375rem", { lineHeight: "1.5rem" }],
        base: ["1.0625rem", { lineHeight: "1.625rem" }],
        lg: ["1.25rem", { lineHeight: "1.75rem" }],
        xl: ["1.375rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
      },
      boxShadow: {
        panel: "0 14px 36px #10201d24",
        dialog: "0 22px 70px #10201d35",
      },
      keyframes: {
        spin: { to: { transform: "rotate(360deg)" } },
        "dialog-in": {
          from: { opacity: "0", transform: "translateY(8px) scale(0.99)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "overdue-pulse": {
          "0%, 100%": {
            backgroundColor: "var(--overdue-bg)",
            boxShadow: "0 0 0 0 var(--overdue-ring)",
          },
          "50%": {
            backgroundColor: "var(--overdue-bg-pulse)",
            boxShadow: "0 0 0 3px var(--overdue-ring)",
          },
        },
      },
      animation: {
        spin: "spin 0.75s linear infinite",
        "dialog-in": "dialog-in 0.18s ease-out",
        "overdue-pulse": "overdue-pulse 1.3s ease-in-out infinite",
      },
    },
  },
  plugins: [forms],
};
