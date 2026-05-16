/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Off-White minimalist palette
        paper:          '#FAFAF8',  // page bg — warm off-white
        surface:        '#FFFFFF',  // cards / panels
        'surface-soft': '#F4F3EE',  // subtle raised
        ink: {
          DEFAULT: '#181816',       // primary text (near-black, warm)
          soft:    '#5B5B57',       // secondary
          mute:    '#8E8E89',       // muted
          faint:   '#B3B3AE',       // very muted
        },
        hairline:        '#ECECE6',  // soft border
        'hairline-strong':'#D9D9D2', // emphasised border / divider
        // Single warm accent — cricket ball
        accent: {
          DEFAULT: '#D9531C',
          soft:    '#FFF1EB',
          strong:  '#B0411A',
          50:      '#FDF4EF',
          400:     '#E2724A',
          500:     '#D9531C',
          600:     '#B0411A',
        },
        // Forest — quiet success / completed / boundary
        pitch: {
          DEFAULT: '#2F6A4F',
          soft:    '#EBF2EE',
          500:     '#2F6A4F',
          600:     '#235340',
        },
        // Quiet wicket / error
        wicket: {
          DEFAULT: '#B23B3B',
          soft:    '#FBECEC',
          500:     '#B23B3B',
        },
      },
      fontFamily: {
        sans:   ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif:  ['var(--font-serif)', 'ui-serif', 'Georgia', 'serif'],
        mono:   ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Tighter, more refined display sizes
        'hero':   ['clamp(56px, 8vw, 112px)', { lineHeight: '0.95', letterSpacing: '-0.035em', fontWeight: '600' }],
        'title':  ['clamp(36px, 5vw, 60px)',  { lineHeight: '1.05', letterSpacing: '-0.025em', fontWeight: '600' }],
        'h2':     ['28px', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '600' }],
        'h3':     ['20px', { lineHeight: '1.25', letterSpacing: '-0.01em',  fontWeight: '600' }],
        'lead':   ['18px', { lineHeight: '1.6',  letterSpacing: '-0.005em' }],
      },
      letterSpacing: {
        eyebrow: '0.14em',
      },
      borderRadius: {
        DEFAULT: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '28px',
      },
      boxShadow: {
        // Almost-invisible elevation — used sparingly
        soft:  '0 1px 2px rgba(24,24,22,0.04), 0 1px 1px rgba(24,24,22,0.02)',
        card:  '0 0 0 1px #ECECE6',
        lift:  '0 1px 2px rgba(24,24,22,0.04), 0 12px 28px -12px rgba(24,24,22,0.08)',
        focus: '0 0 0 4px rgba(217,83,28,0.15)',
      },
      animation: {
        'rise':       'rise 700ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade':       'fade 500ms ease-out both',
        'pulse-dot':  'pulseDot 1.6s ease-in-out infinite',
        'sweep':      'sweep 900ms cubic-bezier(0.16, 1, 0.3, 1) both',
      },
      keyframes: {
        rise:  { '0%': { transform: 'translateY(14px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        fade:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        pulseDot: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(217,83,28,0.4)' },
          '50%':      { opacity: '0.85', boxShadow: '0 0 0 6px rgba(217,83,28,0)' },
        },
        sweep: { '0%': { transform: 'scaleX(0)', transformOrigin: 'left' }, '100%': { transform: 'scaleX(1)', transformOrigin: 'left' } },
      },
    },
  },
  plugins: [],
};
