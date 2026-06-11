import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getTrip } from '@/lib/db';
import TripApp from '@/components/TripApp';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getSession();
  if (!session) redirect('/login');
  const data = await getTrip();
  return <TripApp initialData={data} role={session.role} user={session.user} />;
}
