'use client';
import { useTrip } from '../ctx';
import { AddBtn, Card, DelBtn, EText, EArea, Field, Notice } from '../ui';
import { fmtD } from '@/lib/types';

export default function Trens() {
  const { data, canEdit, mutate } = useTrip();
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Notice>⚠️ <b>Golden Week (01–08/out):</b> trens esgotam MUITO rápido — a venda abre ~15 dias antes
        no 12306/Trip.com; compre no primeiro dia. O passaporte é o bilhete de embarque.</Notice>
      {data.trains.map((t, i) => (
        <Card key={i}>
          <div className="flex items-center justify-between gap-2">
            <div className="text-[16px] font-extrabold flex items-center gap-2 flex-wrap">
              {/maglev/i.test(t.kind) ? '🚝' : '🚄'}
              <EText get={d => d.trains[i].from} set={(d, v) => { d.trains[i].from = v; }} />
              <span className="text-china">→</span>
              <EText get={d => d.trains[i].to} set={(d, v) => { d.trains[i].to = v; }} />
            </div>
            {canEdit && <DelBtn onClick={() => { if (confirm('Excluir trem?')) mutate(d => { d.trains.splice(i, 1); }); }} />}
          </div>
          <div className="text-[12.5px] text-zinc-400 font-semibold mt-0.5 mb-3">
            {fmtD(t.date)}{t.period ? ` · ${t.period}` : ''}
            {t.status?.includes('⏳') && <span className="ml-2 bg-amber-100 text-amber-800 border border-amber-200 rounded-md px-1.5 py-0.5 font-bold">⏳ comprar</span>}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-3">
            <Field label="Tipo"><EText get={d => d.trains[i].kind} set={(d, v) => { d.trains[i].kind = v; }} /></Field>
            <Field label="Duração"><EText get={d => d.trains[i].dur} set={(d, v) => { d.trains[i].dur = v; }} /></Field>
            <Field label="Preço"><EText get={d => d.trains[i].price} set={(d, v) => { d.trains[i].price = v; }} /></Field>
            <Field label="Trem nº"><EText get={d => d.trains[i].num} set={(d, v) => { d.trains[i].num = v; }} /></Field>
            <Field label="Vagão / assento"><EText get={d => d.trains[i].seat} set={(d, v) => { d.trains[i].seat = v; }} /></Field>
            <Field label="Status"><EText get={d => d.trains[i].status} set={(d, v) => { d.trains[i].status = v; }} /></Field>
            <Field label="Obs." className="col-span-2 sm:col-span-3">
              <EArea get={d => d.trains[i].notes} set={(d, v) => { d.trains[i].notes = v; }} />
            </Field>
          </div>
        </Card>
      ))}
      {canEdit && (
        <AddBtn onClick={() => mutate(d => {
          d.trains.push({ date: '2026-10-01', from: '', to: '', kind: '', dur: '', price: '', num: '', seat: '', status: '⏳ comprar', notes: '', period: '' });
        })}>+ adicionar trem</AddBtn>
      )}
    </div>
  );
}
