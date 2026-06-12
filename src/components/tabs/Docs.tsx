'use client';
import { useEffect, useRef, useState } from 'react';
import { useTrip } from '../ctx';
import { Card, Notice } from '../ui';
import type { DocFile } from '@/lib/types';

const CATS: { id: string; label: string }[] = [
  { id: 'voos', label: '✈️ Voos' },
  { id: 'hoteis', label: '🏨 Hotéis' },
  { id: 'trens', label: '🚄 Trens' },
  { id: 'ingressos', label: '🎟️ Ingressos' },
  { id: 'outros', label: '📁 Outros' },
];

export default function Docs() {
  const { role } = useTrip();
  const [files, setFiles] = useState<DocFile[]>([]);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const catRef = useRef('outros');

  async function load() {
    const r = await fetch('/api/files');
    if (r.ok) { const j = await r.json(); setFiles(j.files); setTotal(j.total); }
  }
  useEffect(() => { load(); }, []);

  function pick(cat: string) {
    catRef.current = cat;
    inputRef.current?.click();
  }

  async function onFiles(list: FileList | null) {
    if (!list?.length) return;
    setBusy(true); setErr('');
    for (const f of Array.from(list)) {
      const fd = new FormData();
      fd.append('file', f);
      fd.append('category', catRef.current);
      const r = await fetch('/api/files', { method: 'POST', body: fd });
      if (!r.ok) setErr((await r.json()).error || `Erro ao enviar ${f.name}`);
    }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = '';
    load();
  }

  async function del(f: DocFile) {
    if (!confirm(`Excluir "${f.name}"?`)) return;
    await fetch(`/api/files/${f.id}`, { method: 'DELETE' });
    load();
  }

  const fmtKB = (n: number) => n > 950_000 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Notice>📎 Guarde aqui os PDFs de reservas, bilhetes e comprovantes — tudo num lugar só, acessível
        pelos dois. Máx. 4 MB por arquivo. <b>Dica:</b> baixe os importantes no celular antes de embarcar
        (esta aba precisa de internet).</Notice>

      <input ref={inputRef} type="file" multiple className="hidden"
        accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={e => onFiles(e.target.files)} />

      {err && <div className="text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{err}</div>}
      {busy && <div className="text-[13px] text-zinc-500">⏳ Enviando…</div>}

      {CATS.map(cat => {
        const list = files.filter(f => f.category === cat.id);
        return (
          <Card key={cat.id}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-extrabold text-[14.5px]">{cat.label}
                <span className="text-zinc-400 font-semibold text-[12px] ml-2">{list.length} arquivo{list.length === 1 ? '' : 's'}</span>
              </h3>
              {role === 'editor' && (
                <button onClick={() => pick(cat.id)} disabled={busy}
                  className="text-[12.5px] font-bold text-china border border-china/40 rounded-lg px-3 py-1 hover:bg-china hover:text-white transition cursor-pointer disabled:opacity-40">
                  ⬆️ enviar
                </button>
              )}
            </div>
            {list.length === 0 && <p className="text-[12.5px] text-zinc-300 py-1">nenhum arquivo ainda</p>}
            {list.map(f => (
              <div key={f.id} className="flex items-center gap-3 py-2 border-t border-inkline">
                <span className="text-[18px]">{f.mime?.includes('pdf') ? '📄' : '🖼️'}</span>
                <a href={`/api/files/${f.id}`} target="_blank" rel="noreferrer"
                  className="flex-1 min-w-0 text-[13.5px] font-semibold text-zinc-700 hover:text-china truncate">
                  {f.name}
                  <span className="block text-[11px] font-normal text-zinc-400">
                    {fmtKB(f.size)} · {new Date(f.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </a>
                {role === 'editor' && (
                  <button onClick={() => del(f)} className="text-zinc-300 hover:text-red-600 px-1 cursor-pointer">✕</button>
                )}
              </div>
            ))}
          </Card>
        );
      })}

      <p className="text-[11.5px] text-zinc-400 text-center">
        Total armazenado: {fmtKB(total)} (limite do banco: 512 MB — sem risco)
      </p>
    </div>
  );
}
