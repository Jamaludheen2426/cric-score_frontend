import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Nav } from '@/components/Nav';

export const metadata: Metadata = {
  title: 'CRICKET SCORER — Press Box',
  description: 'Live cricket scoring, broadcast-grade scorecards.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Nav />
          <main className="relative z-10">{children}</main>
          <footer className="relative z-10 mt-24 border-t border-canvas-ridge">
            <div className="page py-8 flex flex-wrap items-baseline justify-between gap-4">
              <p className="overline">est. 2026 — the press box</p>
              <p className="font-mono text-[11px] text-ink-dim uppercase tracking-widest">
                no umpires were harmed in the making of this scorecard
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
