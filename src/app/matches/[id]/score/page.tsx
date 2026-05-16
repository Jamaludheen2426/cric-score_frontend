import { ScorePageContent } from './score-page-content';

export default function ScorePage({ params }: { params: { id: string } }) {
  return <ScorePageContent matchId={Number(params.id)} />;
}
