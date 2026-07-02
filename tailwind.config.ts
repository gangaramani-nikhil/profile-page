import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Terminal OS palette — every color is a CSS token so the whole theme
        // can be re-skinned from :root in index.css.
        bg: 'rgb(var(--bg) / <alpha-value>)',
        panel: 'rgb(var(--panel) / <alpha-value>)',
        grid: 'rgb(var(--grid) / <alpha-value>)',
        neon: 'rgb(var(--neon) / <alpha-value>)',
        amber: 'rgb(var(--amber) / <alpha-value>)',
        cyan: 'rgb(var(--cyan) / <alpha-value>)',
        magenta: 'rgb(var(--magenta) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
        fg: 'rgb(var(--fg) / <alpha-value>)',
        dim: 'rgb(var(--dim) / <alpha-value>)',
        ghost: 'rgb(var(--ghost) / <alpha-value>)',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        neon: '0 0 6px rgb(var(--neon) / 0.55), 0 0 24px rgb(var(--neon) / 0.18)',
        'neon-sm': '0 0 4px rgb(var(--neon) / 0.45)',
        amber: '0 0 6px rgb(var(--amber) / 0.55), 0 0 24px rgb(var(--amber) / 0.18)',
        cyan: '0 0 6px rgb(var(--cyan) / 0.55), 0 0 24px rgb(var(--cyan) / 0.18)',
      },
      animation: {
        blink: 'blink 1.06s step-end infinite',
        flicker: 'flicker 4s linear infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '92%': { opacity: '1' },
          '93%': { opacity: '0.6' },
          '94%': { opacity: '1' },
          '97%': { opacity: '0.8' },
          '98%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
