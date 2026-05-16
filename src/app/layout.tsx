import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Nav } from '@/components/Nav';

export const metadata: Metadata = {
  title: 'Cricket Scorer',
  description: 'A calm, modern way to score and follow a cricket match.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Nav />
          <main>{children}</main>
          <footer className="border-t border-hairline mt-20">
            <div className="page-wide py-10 flex flex-wrap items-baseline justify-between gap-4">
              <p className="text-[13px] text-ink-soft">
                Cricket Scorer · a quiet scoring desk.
              </p>
              <p className="text-[12px] text-ink-mute font-mono">
                v 1.0
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
