import { Nav } from '@/components/Nav';
import { MatchesContent } from './matches-content';

export default function MatchesPage() {
  return (
    <>
      <Nav />
      <div className="page-container">
        <MatchesContent />
      </div>
    </>
  );
}
