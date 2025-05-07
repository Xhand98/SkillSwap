import { customHeroui } from "./custom-hero-plugin";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/react/**/*.{js,ts,jsx,tsx}", // Add this line
  ],
  plugins: [customHeroui()],
  // rest of your config
};
