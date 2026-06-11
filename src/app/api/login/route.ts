import { NextResponse } from 'next/server';
import { checkCredentials, createSessionCookie } from '@/lib/auth';

export async function POST(req: Request) {
  const { user, pass } = await req.json().catch(() => ({}));
  const session = checkCredentials(String(user || '').trim().toLowerCase(), String(pass || ''));
  if (!session) {
    return NextResponse.json({ error: 'Usuário ou senha incorretos' }, { status: 401 });
  }
  await createSessionCookie(session);
  return NextResponse.json({ ok: true, role: session.role });
}
