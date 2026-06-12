'use client';
import { useTrip } from '../ctx';
import { AddBtn, Card, DelBtn, EArea } from '../ui';

export default function Atencao() {
  const { data, role, canEdit, mutate } = useTrip();
  // canEdit (✏️) = editar textos; fora do modo edição, tocar no texto marca/desmarca
  const all = data.attention.flatMap(g => g.items);
  const done = all.filter(x => x.done).length;
  const pct = all.length ? Math.round((done / all.length) * 100) : 0;

  return (
    <div>
      <Card className="mb-4">
        <div className="flex items-baseline justify-between">
          <h3 className="font-extrabold text-[15px]">Progresso geral</h3>
          <span className="text-[13px] font-bold text-zinc-500">{done}/{all.length} · {pct}%</span>
        </div>
        <div className="h-2.5 bg-zinc-100 rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-emerald-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </Card>

      <div className="lg:columns-2 lg:gap-4">
      {data.attention.map((g, gi) => {
        const gd = g.items.filter(x => x.done).length;
        return (
          <Card key={gi} className="mb-4 break-inside-avoid">
            <h3 className="font-extrabold text-[14.5px] mb-1 flex items-center justify-between">
              {g.cat}
              <span className="text-[11.5px] font-bold bg-paper border border-inkline rounded-md px-2 py-0.5 text-zinc-500">
                {gd}/{g.items.length}
              </span>
            </h3>
            {g.items.map((it, ii) => (
              <div key={ii} className={`flex gap-3 items-start py-2 border-t border-inkline ${it.done ? 'opacity-55' : ''}`}>
                <input type="checkbox" checked={it.done} disabled={role !== 'editor'}
                  onChange={e => mutate(d => { d.attention[gi].items[ii].done = e.target.checked; })}
                  className="w-5 h-5 mt-0.5 accent-emerald-600 shrink-0 cursor-pointer" />
                <div className={`flex-1 text-[13.5px] min-w-0 ${it.done ? 'line-through' : ''} ${!canEdit && role === 'editor' ? 'cursor-pointer' : ''}`}
                  onClick={() => { if (!canEdit && role === 'editor') mutate(d => { d.attention[gi].items[ii].done = !it.done; }); }}>
                  <EArea get={d => d.attention[gi].items[ii].text}
                    set={(d, v) => { d.attention[gi].items[ii].text = v; }} />
                </div>
                {canEdit && <DelBtn onClick={() => mutate(d => { d.attention[gi].items.splice(ii, 1); })} />}
              </div>
            ))}
            {canEdit && <div className="mt-2">
              <AddBtn onClick={() => mutate(d => { d.attention[gi].items.push({ text: '', done: false }); })}>+ item</AddBtn>
            </div>}
          </Card>
        );
      })}
      </div>
    </div>
  );
}
