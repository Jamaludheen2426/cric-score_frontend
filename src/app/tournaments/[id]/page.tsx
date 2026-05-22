import { TournamentDetailContent } from './tournament-detail-content';

export default async function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TournamentDetailContent tournamentId={Number(id)} />;
}
