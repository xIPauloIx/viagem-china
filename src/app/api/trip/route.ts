import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getTrip, saveTrip } from '@/lib/db';
import type { TripData } from '@/lib/types';

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'não autenticado' }, { status: 401 });
  const data = await getTrip();
  return NextResponse.json({ data });
}

export async function PUT(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'não autenticado' }, { status: 401 });
  if (s.role !== 'editor')
    return NextResponse.json({ error: 'somente leitura para este usuário' }, { status: 403 });
  const body = await req.json().catch(() => null);
  const data = body?.data as TripData | undefined;
  if (!data || !Array.isArray(data.overview) || !Array.isArray(data.cities))
    return NextResponse.json({ error: 'payload inválido' }, { status: 400 });
  await saveTrip(data);
  return NextResponse.json({ ok: true, savedAt: data.savedAt });
}
