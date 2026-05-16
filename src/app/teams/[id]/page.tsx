import { TeamDetailContent } from './team-detail-content';

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TeamDetailContent teamId={Number(id)} />;
}
