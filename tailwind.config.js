/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/main/webapp/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ab3500',
          container: '#ab3500',
          fixed: '#ab3500',
          'fixed-dim': '#8a2a00',
          on: '#ffffff',
          'on-container': '#ffffff',
          'on-fixed': '#ffffff',
          'on-fixed-variant': '#ffd4c2',
        },
        secondary: {
          DEFAULT: '#00696e',
          container: '#4f8a8e',
          on: '#ffffff',
          'on-container': '#ffffff',
        },
        tertiary: {
          DEFAULT: '#7b4dff',
          container: '#e9ddff',
          on: '#ffffff',
          'on-container': '#2b0050',
          fixed: '#e9ddff',
        },
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
          on: '#ffffff',
          'on-container': '#410002',
        },
        surface: {
          DEFAULT: '#ffffff',
          variant: '#f2e3dc',
          'container-low': '#fcfcfc',
          'container-lowest': '#ffffff',
          'container-high': '#e9e9e9',
          'container-highest': '#e0e0e0',
        },
        background: {
          DEFAULT: '#fcfcfc',
        },
        outline: {
          DEFAULT: '#7a5b4e',
          variant: '#cdbcb3',
        },
      },
      fontFamily: {
        'label-lg': ['Inter', 'system-ui', 'sans-serif'],
        'label-sm': ['Inter', 'system-ui', 'sans-serif'],
        'body-md': ['Inter', 'system-ui', 'sans-serif'],
        'title-lg': ['Inter', 'system-ui', 'sans-serif'],
        'headline-md': ['Inter', 'system-ui', 'sans-serif'],
        'headline-lg': ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'label-lg': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'label-sm': ['12px', { lineHeight: '16px', fontWeight: '500' }],
        'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'title-lg': ['22px', { lineHeight: '28px', fontWeight: '400' }],
        'headline-md': ['28px', { lineHeight: '36px', fontWeight: '400' }],
        'headline-lg': ['32px', { lineHeight: '40px', fontWeight: '400' }],
        'headline-md-mobile': ['24px', { lineHeight: '32px', fontWeight: '700' }],
      },
      spacing: {
        gutter: '16px',
        'container-margin': '16px',
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      animation: {
        spin: 'spin 1s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'zoom-in-95': 'zoomIn 0.2s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        zoomIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      padding: {
        safe: 'env(safe-area-inset-bottom)',
      },
    },
  },

  plugins: [],
};
