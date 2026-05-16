import { LiveScorePage } from './live-score-page';

export default function LivePage({ params }: { params: { id: string } }) {
  return <LiveScorePage matchId={Number(params.id)} />;
}
