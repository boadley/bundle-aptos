/** @type {import('tailwindcss').Config} */
export default { // Changed from module.exports
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Design spec colors
        primary: '#0D1B2A',        // Deep blue background
        surface: '#1F2A37',        // Card backgrounds
        accent: '#00F5D4',         // Mint green CTA
        secondary: '#A9B4C2',      // Light grey secondary text
        disabled: '#5A6470',       // Disabled state
        success: '#2ECC71',        // Success green
        error: '#E74C3C',          // Error red
        white: '#FFFFFF',          // Pure white
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'display': ['32px', { lineHeight: '1.2' }],  // H1
        'headline': ['24px', { lineHeight: '1.3' }], // H2
        'subheadline': ['18px', { lineHeight: '1.4' }], // H3
        'caption': ['14px', { lineHeight: '1.4' }], // Caption
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
};