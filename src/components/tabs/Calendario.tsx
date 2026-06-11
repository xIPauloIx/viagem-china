'use client';
import { useState } from 'react';
import { useTrip } from '../ctx';
import { Card, EArea, EText, Notice } from '../ui';
import { fmtD, cityColor } from '@/lib/types';

export default function Calendario() {
  const { data, canEdit } = useTrip();
  const [view, setView] = useState<'cards' | 'table'>('cards');
  const mode = canEdit ? 'table' : view; // edição pesada sempre na tabela

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <p className="text-[13px] text-zinc-500">
          Visão geral dos 21 dias — manhã, tarde e noite.
        </p>
        {!canEdit && (
          <div className="flex rounded-lg border border-zinc-200 overflow-hidden text-[12.5px] font-semibold">
            <button onClick={() => setView('cards')}
              className={`px-3 py-1.5 cursor-pointer ${view === 'cards' ? 'bg-china text-white' : 'bg-white text-zinc-500'}`}>Cards</button>
            <button onClick={() => setView('table')}
              className={`px-3 py-1.5 cursor-pointer ${view === 'table' ? 'bg-china text-white' : 'bg-white text-zinc-500'}`}>Tabela</button>
          </div>
        )}
      </div>

      {canEdit && <Notice>✏️ Modo edição: a tabela abaixo é feita pra mexer em tudo de uma vez —
        troque cidades e atividades direto nas células (salva sozinho ao sair do campo).</Notice>}

      {mode === 'table' ? <Tabela /> : <Cards />}

      <Card className="mt-5">
        <h3 className="font-bold text-[14px] mb-2">📝 Notas</h3>
        {data.notes.map((_, i) => (
          <div key={i} className="text-[12.5px] text-zinc-500 py-1 border-t border-inkline first:border-0">
            <EArea get={d => d.notes[i]} set={(d, v) => { d.notes[i] = v; }} />
          </div>
        ))}
      </Card>
    </div>
  );
}

function Cards() {
  const { data } = useTrip();
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
      {data.overview.map((d, i) => (
        <Card key={i} className="border-l-4" style={{ borderLeftColor: cityColor(d.city) }}>
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-extrabold text-[14px]">{fmtD(d.date)}</span>
            <span className="text-[12.5px] font-bold" style={{ color: cityColor(d.city) }}>{d.city}</span>
          </div>
          {([['🌅', d.m], ['☀️', d.t], ['🌙', d.n]] as const).map(([ic, tx], j) => (
            <div key={j} className="flex gap-2 py-1.5 border-t border-dashed border-inkline text-[13px]">
              <span className="shrink-0">{ic}</span>
              <span className="whitespace-pre-wrap">{tx || <span className="text-zinc-300">—</span>}</span>
            </div>
          ))}
        </Card>
      ))}
    </div>
  );
}

function Tabela() {
  const { data } = useTrip();
  return (
    <div className="overflow-x-auto rounded-2xl border border-inkline bg-white">
      <table className="w-full text-[13px] min-w-[860px]">
        <thead className="bg-paper">
          <tr className="text-left text-[11px] uppercase tracking-wider text-zinc-400">
            <th className="px-3 py-2.5 w-[92px]">Data</th>
            <th className="px-3 py-2.5 w-[150px]">Cidade</th>
            <th className="px-3 py-2.5">🌅 Manhã</th>
            <th className="px-3 py-2.5">☀️ Tarde</th>
            <th className="px-3 py-2.5">🌙 Noite</th>
          </tr>
        </thead>
        <tbody>
          {data.overview.map((d, i) => (
            <tr key={i} className="border-t border-inkline align-top hover:bg-paper/60">
              <td className="px-3 py-2 font-bold whitespace-nowrap">
                <span className="block">{fmtD(d.date).split(' • ')[0]}</span>
                <span className="text-zinc-400 font-semibold">{fmtD(d.date).split(' • ')[1]}</span>
              </td>
              <td className="px-3 py-2 font-semibold" style={{ color: cityColor(d.city) }}>
                <EText get={x => x.overview[i].city} set={(x, v) => { x.overview[i].city = v; }} />
              </td>
              <td className="px-3 py-2"><EArea get={x => x.overview[i].m} set={(x, v) => { x.overview[i].m = v; }} /></td>
              <td className="px-3 py-2"><EArea get={x => x.overview[i].t} set={(x, v) => { x.overview[i].t = v; }} /></td>
              <td className="px-3 py-2"><EArea get={x => x.overview[i].n} set={(x, v) => { x.overview[i].n = v; }} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
