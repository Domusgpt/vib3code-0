/**
 * VIB34D Design System - Tailwind Configuration
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 * "The Revolution Will Not be in a Structured Format"
 * © 2025 Paul Phillips - Clear Seas Solutions LLC
 */
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  safelist: [
    'bg-cyan-500/30',
    'text-cyan-200',
    'border-cyan-500/50',
    'bg-purple-500/30',
    'text-purple-200',
    'border-purple-500/50',
    'bg-emerald-500/30',
    'text-emerald-200',
    'border-emerald-500/50',
    'bg-amber-500/30',
    'text-amber-200',
    'border-amber-500/50'
  ],
  theme: {
    extend: {
      colors: {
        'vib-cyan': '#22d3ee',
        'vib-purple': '#a855f7'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      }
    }
  },
  plugins: []
};

export default config;
