/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Include all JS/JSX/TS/TSX files in the src folder
    "./public/index.html", // Include your HTML file
  ],
  theme: {
    extend: {
      colors: {
        'tennis-green': '#2d5a27', // A vibrant green color
        'tennis-green-dark': '#45A049',
        'tennis-yellow': '#FFB800',
        'tennis-navy': '#1A2238' // A slightly darker shade of green for hover state
      },
    },
  },
  plugins: [],
};
