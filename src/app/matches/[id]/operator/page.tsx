import { LiveModePage } from '@/components/LiveModePage';

export default async function OperatorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LiveModePage matchId={Number(id)} mode="operator" />;
}
