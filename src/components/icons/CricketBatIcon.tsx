import type { SVGProps } from 'react';

export function CricketBatIcon({ size = 16, strokeWidth = 2, ...props }: SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }) {
  const hidden = props['aria-label'] || props['aria-labelledby'] ? undefined : true;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={hidden}
      {...props}
    >
      <path d="M15.5 3.5 20.5 8.5" />
      <path d="M18 6 9.8 14.2" />
      <path d="M6.1 17.9 8.6 20.4" />
      <path d="M4.6 19.4 6.1 17.9" />
      <path d="M8.3 13.7 10.3 15.7" />
      <path d="M10.3 15.7 19.2 6.8C20.1 5.9 20 4.6 19.1 3.8L18.2 2.9C17.4 2 16.1 1.9 15.2 2.8L6.3 11.7 8.3 13.7Z" />
      <path d="M6.3 11.7 3.8 14.2C3.1 14.9 3.1 16 3.8 16.7L5.3 18.2 9.8 13.7" />
    </svg>
  );
}
