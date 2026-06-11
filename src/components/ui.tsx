'use client';
import { useTrip } from './ctx';
import type { TripData } from '@/lib/types';

/* ---------- edição inline: texto de uma linha ---------- */
export function EText({ get, set, className = '', placeholder = '—' }: {
  get: (d: TripData) => string;
  set: (d: TripData, v: string) => void;
  className?: string; placeholder?: string;
}) {
  const { data, canEdit, mutate } = useTrip();
  const v = get(data) ?? '';
  if (!canEdit) {
    return <span className={className + (v ? '' : ' text-zinc-300')}>{v || placeholder}</span>;
  }
  return (
    <input defaultValue={v} placeholder={placeholder}
      className={`${className} bg-amber-50/80 border border-amber-200 rounded-md px-1.5 py-0.5 outline-none focus:ring-2 focus:ring-gold focus:bg-white w-full min-w-0`}
      onBlur={e => { if (e.target.value !== v) mutate(d => set(d, e.target.value)); }} />
  );
}

/* ---------- edição inline: multilinha ---------- */
export function EArea({ get, set, className = '', placeholder = '—' }: {
  get: (d: TripData) => string;
  set: (d: TripData, v: string) => void;
  className?: string; placeholder?: string;
}) {
  const { data, canEdit, mutate } = useTrip();
  const v = get(data) ?? '';
  if (!canEdit) {
    return <div className={`whitespace-pre-wrap ${className} ${v ? '' : 'text-zinc-300'}`}>{v || placeholder}</div>;
  }
  return (
    <textarea defaultValue={v} placeholder={placeholder} rows={1}
      className={`${className} autogrow w-full bg-amber-50/80 border border-amber-200 rounded-md px-1.5 py-0.5 outline-none focus:ring-2 focus:ring-gold focus:bg-white resize-y`}
      onBlur={e => { if (e.target.value !== v) mutate(d => set(d, e.target.value)); }} />
  );
}

/* ---------- blocos ---------- */
export function Card({ children, className = '', style }: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties;
}) {
  return (
    <div style={style}
      className={`bg-white border border-inkline rounded-2xl p-4 shadow-[0_1px_3px_rgba(80,60,30,.06)] ${className}`}>
      {children}
    </div>
  );
}

export function Field({ label, children, className = '' }: {
  label: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <div className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-400 mb-0.5">{label}</div>
      <div className="text-[13.5px]">{children}</div>
    </div>
  );
}

export function Chip({ children, on, onClick, color }: {
  children: React.ReactNode; on?: boolean; onClick?: () => void; color?: string;
}) {
  return (
    <button onClick={onClick}
      style={on && color ? { background: color, borderColor: color } : undefined}
      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition cursor-pointer
        ${on ? 'bg-china border-china text-white shadow-sm' : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400'}`}>
      {children}
    </button>
  );
}

export function AddBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className="border border-dashed border-zinc-300 text-zinc-500 hover:border-china hover:text-china rounded-lg px-3 py-1.5 text-[12.5px] transition cursor-pointer">
      {children}
    </button>
  );
}

export function DelBtn({ onClick, title = 'Excluir' }: { onClick: () => void; title?: string }) {
  return (
    <button onClick={onClick} title={title}
      className="text-zinc-300 hover:text-red-600 text-[15px] leading-none px-1 transition cursor-pointer">✕</button>
  );
}

export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl px-4 py-2.5 text-[13px] mb-4">
      {children}
    </div>
  );
}
