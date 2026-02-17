import { EditRouteClient } from './edit-route-client';

// Server Component - Awaits params and passes to client
export default async function EditRoutePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <EditRouteClient id={id} />;
}
