/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Our custom color palette
        cream: '#F9F7F3',
        sage: {
          light: '#EBF0E7',
          DEFAULT: '#E3EADD',
          dark: '#C9D6BC',
        },
        lavender: {
          light: '#E5DEEF',
          DEFAULT: '#D7CDEC',
          dark: '#B6A2DD',
        },
        teal: {
          light: '#CBE0E3',
          DEFAULT: '#B7D3D8',
          dark: '#90BAC2',
        },
        blush: {
          light: '#F5E6E7',
          DEFAULT: '#F0D9DA',
          dark: '#E4BABF',
        },
        coral: {
          light: '#EEC1B5',
          DEFAULT: '#E6A897',
          dark: '#D98A74',
        },
        navy: {
          light: '#47597A',
          DEFAULT: '#2A3F5A',
          dark: '#1A2D44',
        },
        slate: {
          light: '#7686A2',
          DEFAULT: '#586C8E',
          dark: '#405070',
        },
      },
      fontFamily: {
        // Our custom fonts
        display: ['var(--font-quicksand)', 'Quicksand', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Atkinson Hyperlegible', 'var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        // Subtle noise texture for backgrounds
        'noise': "url('/textures/noise.png')",
        // Watercolor header gradient
        'watercolor': "linear-gradient(to right, rgba(227, 234, 221, 0.7), rgba(215, 205, 236, 0.7))",
      },
      boxShadow: {
        'soft': '0 5px 15px rgba(42, 63, 90, 0.08)',
        'bubble': '0 2px 5px rgba(42, 63, 90, 0.05)',
        'input': 'inset 0 2px 4px rgba(42, 63, 90, 0.03)',
        'hover': '0 8px 20px rgba(42, 63, 90, 0.12)',
        'focus': '0 0 0 3px rgba(215, 205, 236, 0.3)',
      },
      animation: {
        'pulse': 'pulse 1.5s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'slide-right': 'slideRight 0.3s ease-out forwards',
        'slide-left': 'slideLeft 0.3s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'typing': 'typing 1s ease-in-out infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: 0.4 },
          '50%': { opacity: 0.7 },
        },
        pulseDot: {
          '0%, 100%': { opacity: 0.4 },
          '50%': { opacity: 0.7 },
        },
        slideRight: {
          '0%': { opacity: 0, transform: 'translateX(-10px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        slideLeft: {
          '0%': { opacity: 0, transform: 'translateX(10px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        typing: {
          '0%': { width: '0%' },
          '50%': { width: '50%' },
          '100%': { width: '100%' },
        },
      },
    },
  },
  plugins: [],
}