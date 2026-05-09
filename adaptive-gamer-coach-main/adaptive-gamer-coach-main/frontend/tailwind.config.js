/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0f',
        surface: '#12121a',
        border: '#1e1e2e',
        'neon-green': '#00ff88',
        'neon-red': '#ff2d55',
        'neon-purple': '#7c3aed',
        'neon-cyan': '#00d4ff',
        'text-primary': '#e2e8f0',
        'text-muted': '#64748b',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'glitch': 'glitch 2s infinite',
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'slide-up': 'slide-up 0.4s ease-out forwards',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        glitch: {
          '0%, 90%, 100%': { transform: 'translate(0)', opacity: '1' },
          '92%': { transform: 'translate(-3px, 1px)', opacity: '0.8' },
          '94%': { transform: 'translate(3px, -1px)', opacity: '0.9' },
          '96%': { transform: 'translate(-2px, 2px)', opacity: '0.7' },
          '98%': { transform: 'translate(2px, -2px)', opacity: '1' },
        },
        'pulse-neon': {
          '0%, 100%': { boxShadow: '0 0 5px #00ff88, 0 0 20px #00ff88, 0 0 40px #00ff8844' },
          '50%': { boxShadow: '0 0 10px #00ff88, 0 0 40px #00ff88, 0 0 80px #00ff8866' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
