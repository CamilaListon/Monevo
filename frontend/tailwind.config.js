import forms from "@tailwindcss/forms";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        forest: "#083C35",
        teal: "#0A7C78",
        coral: "#F26A3D",
        canvas: "#F2F4ED",
        ink: "#10201D",
        muted: "#5F6D68",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [forms],
};
