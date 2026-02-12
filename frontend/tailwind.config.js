import daisyui from 'daisyui'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Sans"', 'Inter', 'system-ui', 'sans-serif'],
        body: ['"DM Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    // DaisyUI provides pre-styled components aligned with Tailwind utility classes
    daisyui,
  ],
  daisyui: {
    themes: ['emerald', 'light'],
    base: true,
  },
}

