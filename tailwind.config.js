// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Make sure your files are listed here
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'), // ← Add this line
  ],
}
