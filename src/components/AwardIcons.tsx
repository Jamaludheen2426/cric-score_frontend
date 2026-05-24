// Small icons used in MatchAwards. Inline SVG so they match the
// pitch-green palette via currentColor.

export const Trophy = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

export const Bat = () => (
  // Cricket-bat suggested with a vertical handle + blade
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="3" height="6" rx="1" />
    <path d="M3 9h5l9 9-4 4-9-9z" />
  </svg>
);

export const BowlIcon = () => (
  // A ball with a seam
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3 v18" strokeDasharray="2 2" />
    <path d="M5 8 c4 -2 10 -2 14 0" />
    <path d="M5 16 c4 2 10 2 14 0" />
  </svg>
);
