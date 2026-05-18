/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        app: 'var(--bg-app)',
        card: 'var(--bg-card)',
        elevated: 'var(--bg-elevated)',
        border: 'var(--border)',
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
        green: 'var(--green)',
        red: 'var(--red)',
        blue: 'var(--blue)',
        orange: 'var(--orange)',
        paper: 'var(--bg-app)',
        surface: {
          DEFAULT: 'var(--bg-card)',
          soft: 'var(--bg-elevated)',
        },
        ink: {
          DEFAULT: 'var(--text-primary)',
          soft: 'var(--text-secondary)',
          mute: 'var(--text-muted)',
          faint: 'var(--text-muted)',
        },
        hairline: {
          DEFAULT: 'var(--border-subtle)',
          strong: 'var(--border)',
        },
        accent: {
          DEFAULT: 'var(--green)',
          soft: '#0f2318',
          strong: 'var(--green-bright)',
        },
        pitch: {
          DEFAULT: 'var(--green-text)',
          soft: '#0f2318',
        },
        wicket: {
          DEFAULT: 'var(--red)',
          soft: '#3d0f0f',
        },
      },
      borderRadius: {
        DEFAULT: '6px',
      },
    },
  },
  plugins: [],
};
