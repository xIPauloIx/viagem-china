import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { listDocs, uploadDoc } from '@/lib/files';

const MAX_SIZE = 4 * 1024 * 1024; // limite de payload da Vercel é 4,5 MB

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'não autenticado' }, { status: 401 });
  return NextResponse.json(await listDocs());
}

export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'não autenticado' }, { status: 401 });
  if (s.role !== 'editor')
    return NextResponse.json({ error: 'somente leitura para este usuário' }, { status: 403 });

  const fd = await req.formData().catch(() => null);
  const file = fd?.get('file');
  const category = String(fd?.get('category') || 'outros');
  if (!(file instanceof File))
    return NextResponse.json({ error: 'arquivo ausente' }, { status: 400 });
  if (file.size > MAX_SIZE)
    return NextResponse.json({ error: 'Arquivo muito grande (máx. 4 MB). Comprima o PDF.' }, { status: 413 });

  const buf = Buffer.from(await file.arrayBuffer());
  const pathname = await uploadDoc(category, file.name, buf, file.type || 'application/octet-stream');
  return NextResponse.json({ ok: true, pathname });
}
