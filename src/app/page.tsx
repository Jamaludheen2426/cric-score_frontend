import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center">
      <div className="text-center max-w-xl px-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-pitch-600/20 border border-pitch-600/30 mb-6">
          <span className="text-4xl">🏏</span>
        </div>
        <h1 className="font-display text-5xl font-extrabold text-white mb-3">Cricket Scorer</h1>
        <p className="text-gray-400 text-lg mb-10">Real-time ball-by-ball cricket scoring with live public scorecards.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/matches" className="btn-primary text-center py-3 px-8 text-base">
            View Matches
          </Link>
          <Link href="/teams" className="btn-secondary text-center py-3 px-8 text-base">
            Manage Teams
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: '⚡', label: 'Real-time SSE', desc: 'Live updates without polling' },
            { icon: '🔒', label: 'PIN Protected', desc: 'Secure scorer access' },
            { icon: '🔗', label: 'Share Link', desc: 'Public live scorecard URL' },
          ].map(f => (
            <div key={f.label} className="card-sm">
              <div className="text-2xl mb-1">{f.icon}</div>
              <div className="text-sm font-display font-semibold text-gray-200">{f.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
