/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#FAF7F2',
          200: '#F4EFE6',
          300: '#EBE3D5',
          400: '#DFD5C3',
          500: '#CBBBA3',
          600: '#B29E84',
          700: '#948169',
          800: '#6E5F4E',
          900: '#4A3F33',
        },
        caramel: {
          50: '#FDF8F3',
          100: '#FAF0E4',
          200: '#F4DEBE',
          300: '#EAC893',
          400: '#DFB067',
          500: '#C28340',
          600: '#B86F2C',
          700: '#9C581E',
          800: '#7E4518',
          900: '#5F3414',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          sub: '#F7F3EB',
          border: '#E8E0D2',
          divider: '#EFE7DA',
        },
        text: {
          primary: '#221A15',
          secondary: '#6E6155',
          muted: '#96887A',
        }
      },
      fontFamily: {
        display: ['"Poppins"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        sans: ['"Poppins"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', '"Poppins"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neu-pill': '4px 7px 16px rgba(180, 155, 130, 0.20), -3px -3px 8px rgba(255, 255, 255, 0.90), inset 1px 1px 1.5px rgba(255, 255, 255, 0.80)',
        'neu-card': '0 4px 20px -2px rgba(160, 135, 110, 0.08), 0 2px 6px rgba(0, 0, 0, 0.02)',
        'neu-inset': 'inset 2px 2px 5px rgba(170, 145, 120, 0.12), inset -2px -2px 5px rgba(255, 255, 255, 0.9)',
        'caramel-glow': '0 5px 15px rgba(184, 111, 44, 0.30)',
      }
    },
  },
  plugins: [],
}