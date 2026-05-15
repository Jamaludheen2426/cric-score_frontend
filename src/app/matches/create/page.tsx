import { Nav } from '@/components/Nav';
import { CreateMatchContent } from './create-match-content';

export default function CreateMatchPage() {
  return (
    <>
      <Nav />
      <div className="page-container max-w-2xl">
        <CreateMatchContent />
      </div>
    </>
  );
}
