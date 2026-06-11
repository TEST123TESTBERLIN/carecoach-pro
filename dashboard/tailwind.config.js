/** @type {import('tailwindcss').Config} */
// Tailwind-Konfiguration mit dem CareCoach-Pro-Farbschema (Navy/Emerald).
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Hintergründe (dunkles Navy)
        base: '#0D1B2A',
        panel: '#122236',
        card: '#162840',
        elevated: '#1B3050',
        hover: '#243D5A',
        // Text
        ink: '#F0EDE8',
        muted: '#A8B4C0',
        faint: '#6B7F90',
        // Akzente
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
