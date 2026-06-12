import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { readDoc, deleteDoc } from '@/lib/files';

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'não autenticado' }, { status: 401 });
  const { path } = await params;
  const pathname = path.map(decodeURIComponent).join('/');
  const r = await readDoc(pathname);
  if (!r || r.statusCode !== 200)
    return NextResponse.json({ error: 'não encontrado' }, { status: 404 });
  return new NextResponse(r.stream, {
    headers: {
      'Content-Type': r.blob.contentType || 'application/octet-stream',
      'Content-Disposition': r.blob.contentDisposition || 'inline',
      'Cache-Control': 'private, max-age=3600',
    },
  });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'não autenticado' }, { status: 401 });
  if (s.role !== 'editor')
    return NextResponse.json({ error: 'somente leitura para este usuário' }, { status: 403 });
  const { path } = await params;
  await deleteDoc(path.map(decodeURIComponent).join('/'));
  return NextResponse.json({ ok: true });
}
