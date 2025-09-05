/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['var(--font-orbitron)', 'monospace'],
      },
      colors: {
        'holographic': {
          50: '#f0fdff',
          100: '#ccf7fe',
          200: '#99eefd',
          300: '#55defa',
          400: '#08c8f0',
          500: '#00aadd',
          600: '#0288bb',
          700: '#0a6d97',
          800: '#10597d',
          900: '#144a6a',
        },
      },
      animation: {
        'holographic-spin': 'holographicSpin 2s linear infinite',
        'holographic-gradient': 'holographicGradient 3s ease-in-out infinite',
        'grid-shift': 'gridShift calc(20s / var(--param-time-scale, 1)) linear infinite',
        'extreme-tilt-pulse': 'extremeTiltPulse var(--pulse-speed, 2s) ease-in-out infinite',
      },
      keyframes: {
        holographicSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        holographicGradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        gridShift: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '50px 50px' },
        },
        extremeTiltPulse: {
          '0%, 100%': { 
            filter: 'brightness(calc(1 + var(--extreme-glow, 0) * 0.3)) saturate(calc(1 + var(--extreme-glow, 0) * 0.5)) hue-rotate(calc(var(--extreme-glow, 0) * 30deg))',
          },
          '50%': { 
            filter: 'brightness(calc(1 + var(--extreme-glow, 0) * 0.6)) saturate(calc(1 + var(--extreme-glow, 0) * 0.8)) hue-rotate(calc(var(--extreme-glow, 0) * 60deg))',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      mixBlendMode: {
        'multiply': 'multiply',
        'screen': 'screen', 
        'overlay': 'overlay',
        'color-dodge': 'color-dodge',
        'difference': 'difference',
      },
    },
  },
  plugins: [
    // Custom plugin for holographic effects
    function({ addUtilities }) {
      const holographicUtilities = {
        '.holographic-text': {
          background: 'linear-gradient(45deg, #00ffff, #ff00ff, #ffff00, #00ffff)',
          backgroundSize: '400% 400%',
          '-webkit-background-clip': 'text',
          'background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          animation: 'holographicGradient 3s ease-in-out infinite',
        },
        '.canvas-layer-background': { 
          zIndex: '1', 
          mixBlendMode: 'multiply' 
        },
        '.canvas-layer-shadow': { 
          zIndex: '2', 
          mixBlendMode: 'overlay' 
        },
        '.canvas-layer-content': { 
          zIndex: '3', 
          mixBlendMode: 'screen' 
        },
        '.canvas-layer-highlight': { 
          zIndex: '4', 
          mixBlendMode: 'color-dodge' 
        },
        '.canvas-layer-accent': { 
          zIndex: '5', 
          mixBlendMode: 'difference' 
        },
        '.webgl-canvas': {
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          pointerEvents: 'auto',
          zIndex: '1',
        },
        '.slider-holographic': {
          '&::-webkit-slider-thumb': {
            appearance: 'none',
            height: '16px',
            width: '16px',
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #00ffff, #ff00ff)',
            cursor: 'pointer',
            border: '2px solid #000',
            boxShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
          },
          '&::-moz-range-thumb': {
            height: '16px',
            width: '16px',
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #00ffff, #ff00ff)',
            cursor: 'pointer',
            border: '2px solid #000',
            boxShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
          },
        },
      };
      addUtilities(holographicUtilities);
    },
  ],
}