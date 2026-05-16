import { SummaryContent } from './summary-content';

export default function SummaryPage({ params }: { params: { id: string } }) {
  return <SummaryContent matchId={Number(params.id)} />;
}
