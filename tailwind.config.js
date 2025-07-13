/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        magenta: "#FF00FF", // Or your preferred magenta hex
        teal: "#008080", // Teal color - distinguishable from cyan and green
        bronze: "#CD7F32", // Bronze color - distinguishable from gold but still metallic
      },
    },
  },
  plugins: [],
};
