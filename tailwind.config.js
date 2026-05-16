/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Press Box palette
        ink: {
          DEFAULT: '#F4EFE6',     // paper cream — primary text on dark
          muted: '#8B847A',       // newsprint muted
          dim: '#5C5851',
        },
        canvas: {
          DEFAULT: '#0E0D0B',     // dark warm — newsprint at night
          raised: '#16140F',      // card surface
          ridge: '#1E1B16',       // hover / divider edges
          deep: '#08070A',        // section base
        },
        // Cricket ball saffron — primary accent
        saffron: {
          50:  '#FDF1EB',
          200: '#F5C3AA',
          400: '#EE8956',
          500: '#E8581C',   // primary
          600: '#C8431B',
          700: '#9F341A',
        },
        // Vintage gold — secondary, trophy
        ochre: {
          400: '#E2C282',
          500: '#D4AF6B',
          600: '#A8854A',
        },
        // Pitch green — used sparingly for boundary highlights
        pitch: {
          400: '#5DBE96',
          500: '#3DAC78',
          600: '#2C8A5E',
        },
        // Wicket — desaturated to match aesthetic
        wicket: {
          500: '#CC4B4B',
          600: '#A93C3C',
        },
      },
      fontFamily: {
        display:  ['var(--font-display)', 'serif'],     // Big Shoulders Display
        editorial:['var(--font-editorial)', 'serif'],   // Fraunces (italic chyrons)
        body:     ['var(--font-body)', 'sans-serif'],   // Outfit
        mono:     ['var(--font-mono)', 'monospace'],    // JetBrains Mono
      },
      letterSpacing: {
        widest2: '0.22em',
        widest3: '0.32em',
      },
      animation: {
        'live-pulse':  'livePulse 1.4s ease-in-out infinite',
        'ticker':      'ticker 60s linear infinite',
        'reveal-up':   'revealUp 600ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'reveal-fade': 'revealFade 400ms ease-out both',
        'sweep':       'sweep 1.2s ease-out both',
        'flicker':     'flicker 2.5s ease-in-out infinite',
        'count-flip':  'countFlip 420ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        livePulse: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(232, 88, 28, 0.65)' },
          '50%':      { opacity: '0.95', boxShadow: '0 0 0 7px rgba(232, 88, 28, 0)' },
        },
        ticker: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        revealUp: {
          '0%':   { transform: 'translateY(18px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        revealFade: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        sweep: {
          '0%':   { transform: 'scaleX(0)', transformOrigin: 'left' },
          '100%': { transform: 'scaleX(1)', transformOrigin: 'left' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.92' },
        },
        countFlip: {
          '0%':   { transform: 'translateY(-14px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backgroundImage: {
        'grain':
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.96 0 0 0 0 0.94 0 0 0 0 0.90 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.42'/%3E%3C/svg%3E\")",
        'press-radial':
          'radial-gradient(circle at 75% -10%, rgba(232,88,28,0.16) 0%, transparent 45%), radial-gradient(circle at 5% 110%, rgba(212,175,107,0.10) 0%, transparent 50%)',
      },
      boxShadow: {
        'press':   '0 1px 0 rgba(244,239,230,0.04), 0 28px 60px -28px rgba(0,0,0,0.85)',
        'chyron':  'inset 4px 0 0 0 currentColor',
      },
    },
  },
  plugins: [],
};
