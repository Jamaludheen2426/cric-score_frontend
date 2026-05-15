import { Nav } from '@/components/Nav';
import { LiveScorePage } from './live-score-page';

export default function LivePage({ params }: { params: { id: string } }) {
  return (
    <>
      <Nav />
      <div className="page-container max-w-3xl">
        <LiveScorePage matchId={Number(params.id)} />
      </div>
    </>
  );
}
