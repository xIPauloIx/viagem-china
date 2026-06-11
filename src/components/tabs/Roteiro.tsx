'use client';
import { useTrip } from '../ctx';
import { Card } from '../ui';
import type { City, Flight, Train, Hotel } from '@/lib/types';
import { fmtShort, fmtD, pdate } from '@/lib/types';

type Ev =
  | { kind: 'stay'; key: number; city: City; hotel?: Hotel }
  | { kind: 'flight'; key: number; leg: Flight; idx: number }
  | { kind: 'train'; key: number; leg: Train; idx: number; dayTrip: boolean };

const periodOff: Record<string, number> = {
  'manhã': .2, manha: .2, tarde: .5, 'fim de tarde': .6, noite: .9,
};
const dnum = (iso: string) => pdate(iso).getTime() / 864e5;

export default function Roteiro() {
  const { data, openDia, goTab } = useTrip();

  const events: Ev[] = [];
  data.cities.forEach(c => {
    if (!c.days.length) return;
    const hotel = data.hotels.find(h =>
      c.name.toLowerCase().includes(h.city.toLowerCase()) ||
      h.city.toLowerCase().includes(c.name.split(' ')[0].toLowerCase()));
    events.push({ kind: 'stay', key: dnum(c.days[0].date), city: c, hotel });
  });
  data.flights.forEach((leg, idx) =>
    events.push({ kind: 'flight', key: dnum(leg.date) + .7, leg, idx }));
  data.trains.forEach((leg, idx) =>
    events.push({
      kind: 'train', key: dnum(leg.date) + (periodOff[leg.period?.toLowerCase()] ?? .7),
      leg, idx, dayTrip: /ida e volta|bate.?volta/i.test(`${leg.kind} ${leg.notes}`),
    }));
  events.sort((a, b) => a.key - b.key);

  return (
    <div className="max-w-3xl mx-auto">
      <p className="text-[13px] text-zinc-500 mb-5">
        A viagem inteira em sequência: onde vocês estarão, e como saem de um lugar para o outro.
        Toque numa cidade para abrir o dia a dia, ou num trecho para ver detalhes.
      </p>

      <Endpoint icon="🏠" title="São Paulo" sub="Qua • 30/set — saída de casa" />

      <div className="ml-[21px] border-l-2 border-dashed border-zinc-300">
        {events.map((ev, i) => ev.kind === 'stay'
          ? <StayNode key={i} ev={ev} onOpen={() => openDia(ev.city.id)} />
          : <LegNode key={i} ev={ev} onOpen={() => goTab(ev.kind === 'flight' ? 'voos' : 'trens')} />)}
      </div>

      <Endpoint icon="🏠" title="São Paulo" sub="Ter • 20/out 10:40 — de volta! 🎉" />
    </div>
  );
}

function Endpoint({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="w-11 h-11 rounded-full bg-zinc-800 text-white flex items-center justify-center text-lg shrink-0 shadow">{icon}</div>
      <div>
        <div className="font-extrabold text-[15px]">{title}</div>
        <div className="text-[12px] text-zinc-500">{sub}</div>
      </div>
    </div>
  );
}

function StayNode({ ev, onOpen }: { ev: Extract<Ev, { kind: 'stay' }>; onOpen: () => void }) {
  const c = ev.city;
  const first = c.days[0]?.date, last = c.days[c.days.length - 1]?.date;
  const highlights = c.days.map(d => d.title).filter(Boolean);
  return (
    <div className="relative pl-8 py-3">
      <span className="absolute -left-[9px] top-7 w-4 h-4 rounded-full border-[3px] border-white shadow"
        style={{ background: c.color }} />
      <Card className="cursor-pointer hover:shadow-md transition border-l-4" style={{ borderLeftColor: c.color }}>
        <button onClick={onOpen} className="w-full text-left cursor-pointer">
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <div className="text-[17px] font-extrabold" style={{ color: c.color }}>📍 {c.name}</div>
            <div className="text-[12.5px] font-semibold text-zinc-500">
              {first && fmtShort(first)} → {last && fmtShort(last)} · {c.days.length} {c.days.length > 1 ? 'dias' : 'dia'}
            </div>
          </div>
          <div className="mt-1 text-[12.5px] text-zinc-500">
            {ev.hotel?.name
              ? <>🏨 {ev.hotel.name} <span className="text-zinc-400">({ev.hotel.nights})</span></>
              : <span className="text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-1.5 py-0.5">🏨 hotel a definir · {ev.hotel?.nights ?? ''}</span>}
          </div>
          {highlights.length > 0 && (
            <ul className="mt-2 space-y-0.5">
              {c.days.map((d, i) => (
                <li key={i} className="text-[13px] text-zinc-600 flex gap-2">
                  <span className="text-zinc-400 font-semibold w-[88px] shrink-0 whitespace-nowrap">{fmtD(d.date).split(' • ')[1]} {fmtD(d.date).split(' • ')[0]}</span>
                  <span className="truncate">{d.title || '—'}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-2 text-[12px] font-semibold" style={{ color: c.color }}>ver dia a dia →</div>
        </button>
      </Card>
    </div>
  );
}

function LegNode({ ev, onOpen }: { ev: Extract<Ev, { kind: 'flight' | 'train' }>; onOpen: () => void }) {
  const leg = ev.leg;
  const icon = ev.kind === 'flight' ? '✈️' : /maglev/i.test((leg as Train).kind ?? '') ? '🚝' : '🚄';
  const dayTrip = ev.kind === 'train' && ev.dayTrip;
  const train = ev.kind === 'train' ? (leg as Train) : null;
  const flight = ev.kind === 'flight' ? (leg as Flight) : null;
  const pending = train && train.status?.includes('⏳');
  return (
    <div className="relative pl-8 py-1.5">
      <span className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-white border-2 flex items-center justify-center shadow-sm
        ${dayTrip ? '-left-[15px] w-7 h-7 text-[13px]' : '-left-[18px] w-9 h-9 text-[16px]'}`}
        style={{ borderColor: '#c9bda9' }}>{icon}</span>
      <button onClick={onOpen}
        className={`w-full text-left rounded-xl border bg-white/70 hover:bg-white hover:shadow-sm transition px-3.5 cursor-pointer
          ${dayTrip ? 'py-1.5 border-dashed border-zinc-200' : 'py-2.5 border-zinc-200'}`}>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className={`font-bold ${dayTrip ? 'text-[12.5px] text-zinc-500' : 'text-[13.5px] text-zinc-700'}`}>
            {dayTrip && <span className="text-[11px] font-semibold text-zinc-400 mr-1.5">↩ bate-volta</span>}
            {leg.from} <span className="text-china">→</span> {leg.to}
          </div>
          <div className="text-[11.5px] text-zinc-400 font-medium">
            {fmtShort(leg.date)}{train?.period ? ` · ${train.period}` : ''}
            {train?.dur ? ` · ${train.dur}` : ''}{flight?.dep ? ` · ${flight.dep}` : ''}
          </div>
        </div>
        {!dayTrip && (
          <div className="text-[11.5px] text-zinc-400 mt-0.5 flex items-center gap-2 flex-wrap">
            {train && <>{train.kind}{train.price && <> · {train.price}</>}</>}
            {flight && <>{flight.airline}{flight.num && <> · {flight.num}</>}{flight.arr && <> · chega {flight.arr}</>}</>}
            {pending && <span className="bg-amber-100 text-amber-800 border border-amber-200 rounded-md px-1.5 font-semibold">⏳ comprar</span>}
            {train?.num && <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md px-1.5 font-semibold">{train.num}</span>}
          </div>
        )}
      </button>
    </div>
  );
}
