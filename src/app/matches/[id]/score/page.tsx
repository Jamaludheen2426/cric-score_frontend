import { Nav } from '@/components/Nav';
import { ScorePageContent } from './score-page-content';

export default function ScorePage({ params }: { params: { id: string } }) {
  return (
    <>
      <Nav />
      <ScorePageContent matchId={Number(params.id)} />
    </>
  );
}
