/** @type {import('tailwindcss').Config} */
// Tailwind-Konfiguration mit dem CareCoach-Pro-Farbschema (Navy/Emerald).
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Semantische Hintergründe — wechseln per CSS-Variable (Dark/Light).
        base: 'var(--color-base)',
        panel: 'var(--color-panel)',
        card: 'var(--color-card)',
        elevated: 'var(--color-elevated)',
        hover: 'var(--color-hover)',
        // Semantische Textfarben — wechseln per CSS-Variable.
        ink: 'var(--color-ink)',
        muted: 'var(--color-muted)',
        faint: 'var(--color-faint)',
        // Akzente — themenunabhängig (kein CSS-Variable nötig).
        brand: '#2ECC8A',
        warn: '#F5A623',
        danger: '#FF6B6B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
