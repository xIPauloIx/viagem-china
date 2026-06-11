'use client';
import { useTrip } from '../ctx';
import { AddBtn, Card, DelBtn, EText, EArea, Field, Notice } from '../ui';
import { cityColor } from '@/lib/types';

export default function Hoteis() {
  const { data, canEdit, mutate } = useTrip();
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Notice>💡 Preencha o <b>Endereço (中文)</b> — é o que se mostra ao taxista/Didi.
        Copie do Trip.com ou peça ao hotel.</Notice>
      {data.hotels.map((h, i) => (
        <Card key={i} className="border-l-4" style={{ borderLeftColor: cityColor(h.city) }}>
          <div className="flex items-center justify-between gap-2">
            <div className="text-[16px] font-extrabold flex items-center gap-2 flex-wrap">
              🏨 <EText get={d => d.hotels[i].city} set={(d, v) => { d.hotels[i].city = v; }} />
              <span className="text-[11.5px] font-bold bg-paper border border-inkline rounded-md px-2 py-0.5 text-zinc-500">
                <EText get={d => d.hotels[i].nights} set={(d, v) => { d.hotels[i].nights = v; }} />
              </span>
            </div>
            {canEdit && <DelBtn onClick={() => { if (confirm('Excluir hotel?')) mutate(d => { d.hotels.splice(i, 1); }); }} />}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-3 mt-3">
            <Field label="Hotel" className="col-span-2"><EText get={d => d.hotels[i].name} set={(d, v) => { d.hotels[i].name = v; }} placeholder="a definir…" /></Field>
            <Field label="Reserva nº"><EText get={d => d.hotels[i].reservation} set={(d, v) => { d.hotels[i].reservation = v; }} /></Field>
            <Field label="Check-in"><EText get={d => d.hotels[i].checkin} set={(d, v) => { d.hotels[i].checkin = v; }} /></Field>
            <Field label="Check-out"><EText get={d => d.hotels[i].checkout} set={(d, v) => { d.hotels[i].checkout = v; }} /></Field>
            <Field label="Preço"><EText get={d => d.hotels[i].price} set={(d, v) => { d.hotels[i].price = v; }} /></Field>
            <Field label="Endereço" className="col-span-2 sm:col-span-3">
              <EArea get={d => d.hotels[i].address} set={(d, v) => { d.hotels[i].address = v; }} />
            </Field>
            <Field label="Endereço (中文) — mostrar ao taxista" className="col-span-2 sm:col-span-3">
              <EArea className="text-[16px]" get={d => d.hotels[i].addressZh} set={(d, v) => { d.hotels[i].addressZh = v; }} />
            </Field>
            <Field label="Obs." className="col-span-2 sm:col-span-3">
              <EArea get={d => d.hotels[i].notes} set={(d, v) => { d.hotels[i].notes = v; }} />
            </Field>
          </div>
        </Card>
      ))}
      {canEdit && (
        <AddBtn onClick={() => mutate(d => {
          d.hotels.push({ city: '', nights: '? noites', name: '', checkin: '', checkout: '', address: '', addressZh: '', reservation: '', price: '', notes: '' });
        })}>+ adicionar hotel</AddBtn>
      )}
    </div>
  );
}
