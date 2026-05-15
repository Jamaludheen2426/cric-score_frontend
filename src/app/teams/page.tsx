import { Nav } from '@/components/Nav';
import { TeamsContent } from './teams-content';

export default function TeamsPage() {
  return (
    <>
      <Nav />
      <div className="page-container">
        <TeamsContent />
      </div>
    </>
  );
}
