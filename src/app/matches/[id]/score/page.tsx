import { ScorePageContent } from './score-page-content';

export default async function ScorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ScorePageContent matchId={Number(id)} />;
}
