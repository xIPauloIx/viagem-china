import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getFile, deleteFile } from '@/lib/db';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'não autenticado' }, { status: 401 });
  const { id } = await params;
  const f = await getFile(Number(id));
  if (!f) return NextResponse.json({ error: 'não encontrado' }, { status: 404 });
  return new NextResponse(new Uint8Array(f.data), {
    headers: {
      'Content-Type': f.mime || 'application/octet-stream',
      'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(f.name)}`,
      'Cache-Control': 'private, max-age=3600',
    },
  });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'não autenticado' }, { status: 401 });
  if (s.role !== 'editor')
    return NextResponse.json({ error: 'somente leitura para este usuário' }, { status: 403 });
  const { id } = await params;
  await deleteFile(Number(id));
  return NextResponse.json({ ok: true });
}
