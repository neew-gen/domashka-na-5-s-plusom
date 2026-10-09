/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'var(--color-ink)',
        paper: 'var(--color-paper)',
        hairline: 'var(--color-hairline)',
        accent: 'var(--color-accent)',
        success: 'var(--color-success)',
        overdue: 'var(--color-overdue)',
        'importance-low': 'var(--color-importance-low)',
        'importance-medium': 'var(--color-importance-medium)',
        'importance-high': 'var(--color-importance-high)',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
