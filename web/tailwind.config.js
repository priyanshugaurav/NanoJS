/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Menlo', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        editor: {
          bg: '#0d1117',
          sidebar: '#161b22',
          border: '#30363d',
          accent: '#58a6ff',
          success: '#3fb950',
          warning: '#d29922',
          danger: '#f85149',
        }
      }
    },
  },
  plugins: [],
}
