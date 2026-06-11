'use client';
import { useTrip } from '../ctx';
import { AddBtn, Card, DelBtn, EText, EArea, Field } from '../ui';
import { fmtD } from '@/lib/types';

export default function Voos() {
  const { data, canEdit, mutate } = useTrip();
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {data.flights.map((f, i) => (
        <Card key={i}>
          <div className="flex items-center justify-between gap-2">
            <div className="text-[16px] font-extrabold flex items-center gap-2 flex-wrap">
              ✈️ <EText get={d => d.flights[i].from} set={(d, v) => { d.flights[i].from = v; }} />
              <span className="text-china">→</span>
              <EText get={d => d.flights[i].to} set={(d, v) => { d.flights[i].to = v; }} />
            </div>
            {canEdit && <DelBtn onClick={() => { if (confirm('Excluir voo?')) mutate(d => { d.flights.splice(i, 1); }); }} />}
          </div>
          <div className="text-[12.5px] text-zinc-400 font-semibold mt-0.5 mb-3">{fmtD(f.date)}</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-3">
            <Field label="Companhia"><EText get={d => d.flights[i].airline} set={(d, v) => { d.flights[i].airline = v; }} /></Field>
            <Field label="Voo nº"><EText get={d => d.flights[i].num} set={(d, v) => { d.flights[i].num = v; }} /></Field>
            <Field label="Localizador"><EText get={d => d.flights[i].locator} set={(d, v) => { d.flights[i].locator = v; }} /></Field>
            <Field label="Partida"><EText get={d => d.flights[i].dep} set={(d, v) => { d.flights[i].dep = v; }} /></Field>
            <Field label="Chegada"><EText get={d => d.flights[i].arr} set={(d, v) => { d.flights[i].arr = v; }} /></Field>
            <Field label="Assentos"><EText get={d => d.flights[i].seats} set={(d, v) => { d.flights[i].seats = v; }} /></Field>
            <Field label="Obs." className="col-span-2 sm:col-span-3">
              <EArea get={d => d.flights[i].notes} set={(d, v) => { d.flights[i].notes = v; }} />
            </Field>
          </div>
        </Card>
      ))}
      {canEdit && (
        <AddBtn onClick={() => mutate(d => {
          d.flights.push({ date: '2026-10-01', from: '', to: '', airline: '', num: '', dep: '', arr: '', locator: '', seats: '', notes: '' });
        })}>+ adicionar voo</AddBtn>
      )}
    </div>
  );
}
