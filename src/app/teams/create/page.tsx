import { Nav } from '@/components/Nav';
import { CreateTeamContent } from './create-team-content';

export default function CreateTeamPage() {
  return (
    <>
      <Nav />
      <div className="page-container max-w-2xl">
        <CreateTeamContent />
      </div>
    </>
  );
}
