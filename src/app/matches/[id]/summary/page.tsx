import { Nav } from '@/components/Nav';
import { SummaryContent } from './summary-content';

export default function SummaryPage({ params }: { params: { id: string } }) {
  return (
    <>
      <Nav />
      <div className="page-container max-w-3xl">
        <SummaryContent matchId={Number(params.id)} />
      </div>
    </>
  );
}
