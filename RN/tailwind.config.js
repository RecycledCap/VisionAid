/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "media", // or 'class'
  theme: {
    extend: {
      colors: {
        contrastLight: "#000000", // black text
        contrastDark: "#ffffff",  // white text
        bgLight: "#ffffff",
        bgDark: "#000000",
        accentLight: "#0057FF",
        accentDark: "#FFD700",
      },
    },
  },
  plugins: [],
}