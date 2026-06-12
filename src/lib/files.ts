// Documentos da viagem no Vercel Blob (store privado china-docs).
// Pathname = "<categoria>/<nome do arquivo>"; download sempre via proxy autenticado do app.
import { del, get, list, put } from '@vercel/blob';

// Autenticação resolvida pelo SDK via env: BLOB_READ_WRITE_TOKEN (token clássico)
// ou VERCEL_OIDC_TOKEN + BLOB_STORE_ID (fluxo OIDC — o que o connect criou).
// Local: `npx vercel env pull .env.local` renova o OIDC token (expira em ~12h).
const opts = () => process.env.BLOB_READ_WRITE_TOKEN
  ? { token: process.env.BLOB_READ_WRITE_TOKEN }
  : {};

export interface StoredFile {
  pathname: string; name: string; category: string;
  size: number; uploadedAt: string;
}

export async function listDocs(): Promise<{ files: StoredFile[]; total: number }> {
  const r = await list({ ...opts() });
  const files = r.blobs.map(b => {
    const [category, ...rest] = b.pathname.split('/');
    return {
      pathname: b.pathname,
      name: rest.join('/') || b.pathname,
      category: rest.length ? category : 'outros',
      size: b.size,
      uploadedAt: (b.uploadedAt instanceof Date ? b.uploadedAt : new Date(b.uploadedAt)).toISOString(),
    };
  });
  return { files, total: files.reduce((a, f) => a + f.size, 0) };
}

export async function uploadDoc(category: string, name: string, buf: Buffer, mime: string) {
  const safeCat = /^[a-z]+$/.test(category) ? category : 'outros';
  const r = await put(`${safeCat}/${name}`, buf, {
    access: 'private', addRandomSuffix: true, contentType: mime, ...opts(),
  });
  return r.pathname;
}

export async function readDoc(pathname: string) {
  return get(pathname, { access: 'private', ...opts() });
}

export async function deleteDoc(pathname: string) {
  await del(pathname, { ...opts() });
}
