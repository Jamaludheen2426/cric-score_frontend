import { TeamDetailContent } from './team-detail-content';

export default function TeamPage({ params }: { params: { id: string } }) {
  return <TeamDetailContent teamId={Number(params.id)} />;
}
