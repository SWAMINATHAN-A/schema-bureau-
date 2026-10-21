/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        bg: 'var(--nx-bg)',
        surface: 'var(--nx-surface)',
        surface2: 'var(--nx-surface-2)',
        elevated: 'var(--nx-elevated)',
        line: 'var(--nx-border)',
        line2: 'var(--nx-border-strong)',
        fg: 'var(--nx-text)',
        muted: 'var(--nx-muted)',
        faint: 'var(--nx-faint)',
        accent: 'var(--nx-accent)',
        accentSoft: 'var(--nx-accent-soft)',
        accentFg: 'var(--nx-accent-fg)',
        danger: 'var(--nx-danger)',
        dangerSoft: 'var(--nx-danger-soft)',
        warn: 'var(--nx-warn)',
        warnSoft: 'var(--nx-warn-soft)',
        ok: 'var(--nx-ok)',
        okSoft: 'var(--nx-ok-soft)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }]
      },
      borderRadius: {
        sm: '3px',
        DEFAULT: '5px',
        md: '6px',
        lg: '8px',
        xl: '10px'
      }
    }
  },
  plugins: []
}
