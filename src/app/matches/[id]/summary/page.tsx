import { SummaryContent } from './summary-content';

export default async function SummaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SummaryContent matchId={Number(id)} />;
}
