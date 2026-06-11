'use client';
import { useState } from 'react';
import { useTrip } from '../ctx';
import { AddBtn, Card, DelBtn, EText, Notice } from '../ui';
import type { Phrase } from '@/lib/types';

export default function Frases() {
  const { data, canEdit, mutate } = useTrip();
  const [q, setQ] = useState('');
  const [modal, setModal] = useState<Phrase | null>(null);
  const ql = q.toLowerCase();

  function speak(p: Phrase) {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(p.zh);
    u.lang = 'zh-CN'; u.rate = 0.8;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <input value={q} onChange={e => setQ(e.target.value)}
        placeholder="🔎 Buscar frase… (ex.: pimenta, banheiro, pagar)"
        className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-[14px] outline-none focus:ring-2 focus:ring-china mb-3" />
      <Notice>👆 Toque numa frase para abrir em <b>tela cheia</b> e mostrar ao atendente.
        O 🔊 fala em chinês (se o aparelho tiver a voz instalada).</Notice>

      {data.phrases.map((g, gi) => {
        const items = g.items.map((p, pi) => ({ p, pi })).filter(({ p }) =>
          !ql || p.pt.toLowerCase().includes(ql) || p.py.toLowerCase().includes(ql) || p.zh.includes(q));
        if (!items.length) return null;
        return (
          <Card key={gi} className="mb-4">
            <h3 className="font-extrabold text-[14.5px] mb-1">{g.cat}</h3>
            {items.map(({ p, pi }) => (
              <div key={pi}
                className="flex items-center gap-3 py-2.5 border-t border-inkline cursor-pointer hover:bg-paper/70 transition rounded-md px-1 -mx-1"
                onClick={() => !canEdit && setModal(p)}>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px]">
                    {canEdit ? <EText get={d => d.phrases[gi].items[pi].pt} set={(d, v) => { d.phrases[gi].items[pi].pt = v; }} /> : p.pt}
                  </div>
                  <div className="text-[11.5px] text-zinc-400">
                    {canEdit ? <EText get={d => d.phrases[gi].items[pi].py} set={(d, v) => { d.phrases[gi].items[pi].py = v; }} /> : p.py}
                  </div>
                </div>
                <div className="text-[21px] font-bold whitespace-nowrap" style={{ fontFamily: 'var(--font-noto), sans-serif' }}>
                  {canEdit ? <EText get={d => d.phrases[gi].items[pi].zh} set={(d, v) => { d.phrases[gi].items[pi].zh = v; }} /> : p.zh}
                </div>
                {canEdit && <DelBtn onClick={() => mutate(d => { d.phrases[gi].items.splice(pi, 1); })} />}
              </div>
            ))}
            {canEdit && <div className="mt-2">
              <AddBtn onClick={() => mutate(d => { d.phrases[gi].items.push({ pt: '', zh: '', py: '' }); })}>+ frase</AddBtn>
            </div>}
          </Card>
        );
      })}

      {modal && (
        <div className="fixed inset-0 z-[3000] bg-[rgba(18,8,4,.94)] flex flex-col items-center justify-center text-center text-white p-6 cursor-pointer"
          onClick={() => setModal(null)}>
          <div className="font-extrabold leading-tight" style={{ fontSize: 'min(16vw,110px)', fontFamily: 'var(--font-noto), sans-serif' }}>
            {modal.zh}
          </div>
          <div className="text-gold text-2xl mt-5">{modal.py}</div>
          <div className="text-white/70 text-base mt-2">{modal.pt}</div>
          <button onClick={e => { e.stopPropagation(); speak(modal); }}
            className="mt-8 w-14 h-14 rounded-full border-2 border-white/40 text-2xl hover:bg-white/10 transition cursor-pointer">🔊</button>
          <div className="absolute bottom-5 text-[12px] text-white/40">toque para fechar — mostre a tela para o atendente 😉</div>
        </div>
      )}
    </div>
  );
}
