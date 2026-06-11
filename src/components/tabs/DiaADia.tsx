'use client';
import { useEffect, useMemo, useState } from 'react';
import { useTrip } from '../ctx';
import { AddBtn, Card, Chip, DelBtn, EArea, EText } from '../ui';
import { fmtD, fmtShort, pdate } from '@/lib/types';

import type { CitySections } from '@/lib/types';

const SEC_LABELS: Record<keyof CitySections, string> = {
  restaurantes: '🍽️ Restaurantes', ingressos: '🎟️ Ingressos',
  transportes: '🚌 Transportes', dicas: '💡 Dicas', alteracoes: '✏️ Alterações vs. original',
};

export default function DiaADia() {
  const { data, canEdit, mutate, diaCity } = useTrip();

  // lista achatada de todos os dias da viagem (cidade + índice do dia)
  const flat = useMemo(() =>
    data.cities.flatMap((c, ci) => c.days.map((d, di) => ({ ci, di, date: d.date, cityId: c.id }))),
    [data.cities]);

  const [pos, setPos] = useState(0);
  useEffect(() => {
    if (diaCity) {
      const i = flat.findIndex(f => f.cityId === diaCity);
      if (i >= 0) setPos(i);
    }
  }, [diaCity, flat]);
  const cur = flat[Math.min(pos, flat.length - 1)];
  if (!cur) return <p>Sem dias cadastrados.</p>;
  const city = data.cities[cur.ci];
  const day = city.days[cur.di];

  return (
    <div className="max-w-3xl mx-auto">
      {/* seletor de cidade */}
      <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {data.cities.map((c, ci) => (
          <Chip key={c.id} on={ci === cur.ci} color={c.color}
            onClick={() => setPos(flat.findIndex(f => f.ci === ci))}>
            {c.name} <span className="opacity-70 text-[11px]">({c.range})</span>
          </Chip>
        ))}
      </div>
      {/* seletor de dia dentro da cidade */}
      <div className="flex gap-1.5 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {city.days.map((d, di) => (
          <button key={di} onClick={() => setPos(flat.findIndex(f => f.ci === cur.ci && f.di === di))}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-[12.5px] font-bold border transition cursor-pointer
              ${di === cur.di ? 'text-white shadow-sm' : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400'}`}
            style={di === cur.di ? { background: city.color, borderColor: city.color } : undefined}>
            {fmtShort(d.date)}
          </button>
        ))}
        {canEdit && (
          <AddBtn onClick={() => mutate(d => {
            const days = d.cities[cur.ci].days;
            const lastDate = days[days.length - 1]?.date ?? '2026-10-01';
            const nd = pdate(lastDate); nd.setDate(nd.getDate() + 1);
            const y = nd.getFullYear(), m = String(nd.getMonth() + 1).padStart(2, '0'), dd = String(nd.getDate()).padStart(2, '0');
            days.push({ date: `${y}-${m}-${dd}`, title: 'Novo dia', slots: [{ t: '09:00', x: '' }] });
          })}>+ dia</AddBtn>
        )}
      </div>

      {/* navegação dia anterior / próximo (atravessa cidades) */}
      <div className="flex items-center justify-between gap-3 my-3">
        <NavBtn dir="prev" disabled={pos === 0} onClick={() => setPos(p => p - 1)} />
        <div className="text-center min-w-0">
          <div className="font-extrabold text-[16px]">{fmtD(day.date)}</div>
          <div className="text-[13px] font-bold truncate" style={{ color: city.color }}>
            {canEdit
              ? <EText get={d => d.cities[cur.ci].days[cur.di].title} set={(d, v) => { d.cities[cur.ci].days[cur.di].title = v; }} />
              : (day.title || city.name)}
          </div>
        </div>
        <NavBtn dir="next" disabled={pos === flat.length - 1} onClick={() => setPos(p => p + 1)} />
      </div>

      {/* o dia */}
      <Card className="border-t-4" style={{ borderTopColor: city.color }}>
        {day.slots.map((s, si) => (
          <div key={`${cur.ci}-${cur.di}-${si}`} className="flex gap-3 py-2.5 border-b border-dashed border-inkline last:border-0 items-start">
            <div className="w-[52px] shrink-0 font-extrabold text-[12.5px] text-zinc-400 pt-0.5">
              {canEdit
                ? <EText get={d => d.cities[cur.ci].days[cur.di].slots[si].t} set={(d, v) => { d.cities[cur.ci].days[cur.di].slots[si].t = v; }} />
                : s.t}
            </div>
            <div className="flex-1 text-[13.5px] min-w-0">
              <EArea get={d => d.cities[cur.ci].days[cur.di].slots[si].x}
                set={(d, v) => { d.cities[cur.ci].days[cur.di].slots[si].x = v; }} />
            </div>
            {canEdit && <DelBtn onClick={() => mutate(d => { d.cities[cur.ci].days[cur.di].slots.splice(si, 1); })} />}
          </div>
        ))}
        {canEdit && (
          <div className="flex gap-2 mt-3">
            <AddBtn onClick={() => mutate(d => { d.cities[cur.ci].days[cur.di].slots.push({ t: '00:00', x: '' }); })}>+ horário</AddBtn>
            <AddBtn onClick={() => {
              if (confirm('Excluir este dia inteiro?')) {
                setPos(p => Math.max(0, p - 1));
                mutate(d => { d.cities[cur.ci].days.splice(cur.di, 1); });
              }
            }}>🗑 excluir dia</AddBtn>
          </div>
        )}
      </Card>

      {/* informações da cidade */}
      <h3 className="font-extrabold text-[15px] mt-6 mb-2" style={{ color: city.color }}>
        ℹ️ {city.name} — informações gerais
      </h3>
      {(Object.keys(SEC_LABELS) as (keyof CitySections)[]).map(k => {
        const list = city.sections[k];
        if (!list?.length && !canEdit) return null;
        return (
          <details key={k} className="bg-white border border-inkline rounded-xl mb-2 overflow-hidden group">
            <summary className="px-4 py-2.5 font-bold text-[13.5px] cursor-pointer hover:bg-paper transition list-none flex justify-between items-center">
              {SEC_LABELS[k]} <span className="text-zinc-300 group-open:rotate-90 transition">▸</span>
            </summary>
            <div className="px-4 pb-3">
              {list.map((_, li) => (
                <div key={li} className="flex gap-2 items-start text-[13px] py-1.5 border-t border-inkline first:border-0">
                  <div className="flex-1 min-w-0">
                    <EArea get={d => d.cities[cur.ci].sections[k][li]}
                      set={(d, v) => { d.cities[cur.ci].sections[k][li] = v; }} />
                  </div>
                  {canEdit && <DelBtn onClick={() => mutate(d => { d.cities[cur.ci].sections[k].splice(li, 1); })} />}
                </div>
              ))}
              {canEdit && <div className="mt-2"><AddBtn onClick={() => mutate(d => { d.cities[cur.ci].sections[k].push(''); })}>+ item</AddBtn></div>}
            </div>
          </details>
        );
      })}
    </div>
  );
}

function NavBtn({ dir, disabled, onClick }: { dir: 'prev' | 'next'; disabled: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="shrink-0 w-11 h-11 rounded-full bg-white border border-zinc-200 text-zinc-600 font-bold text-lg
        hover:border-china hover:text-china disabled:opacity-30 disabled:cursor-default transition cursor-pointer shadow-sm">
      {dir === 'prev' ? '←' : '→'}
    </button>
  );
}
