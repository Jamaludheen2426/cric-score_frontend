import { LiveModePage } from '@/components/LiveModePage';

export default async function TvPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LiveModePage matchId={Number(id)} mode="tv" />;
}
