import { Nav } from '@/components/Nav';
import { TeamDetailContent } from './team-detail-content';

export default function TeamPage({ params }: { params: { id: string } }) {
  return (
    <>
      <Nav />
      <div className="page-container max-w-2xl">
        <TeamDetailContent teamId={Number(params.id)} />
      </div>
    </>
  );
}
