export interface Slot { t: string; x: string }
export interface Day { date: string; title: string; slots: Slot[] }
export interface CitySections {
  restaurantes: string[]; ingressos: string[]; transportes: string[];
  dicas: string[]; alteracoes: string[];
}
export interface City {
  id: string; name: string; range: string; color: string;
  lat: number; lng: number; days: Day[]; sections: CitySections;
  /** trechos de voo ida/volta — fora do mapa e do roteiro de estadias */
  transit?: boolean;
}
export interface Leg {
  from: [number, number]; to: [number, number];
  icon: string; label: string; minor?: boolean;
}
export interface DocFile {
  id: number; name: string; category: string; mime: string;
  size: number; created_at: string;
}
export interface OverviewDay { date: string; city: string; m: string; t: string; n: string }
export interface Poi { city: string; name: string; lat: number; lng: number; note?: string; date?: string | null }
export interface Flight {
  date: string; from: string; to: string; airline: string; num: string;
  dep: string; arr: string; locator: string; seats: string; notes: string;
}
export interface Hotel {
  city: string; nights: string; name: string; checkin: string; checkout: string;
  address: string; addressZh: string; reservation: string; price: string; notes: string;
}
export interface Train {
  date: string; from: string; to: string; kind: string; dur: string; price: string;
  num: string; seat: string; status: string; notes: string; period: string;
}
export interface AttItem { text: string; done: boolean }
export interface AttGroup { cat: string; items: AttItem[] }
export interface Phrase { pt: string; zh: string; py: string }
export interface PhraseGroup { cat: string; items: Phrase[] }

export interface TripData {
  version: number; savedAt: string;
  overview: OverviewDay[]; notes: string[]; cities: City[];
  pois: Poi[]; route: [number, number][]; legs?: Leg[];
  flights: Flight[]; hotels: Hotel[]; trains: Train[];
  attention: AttGroup[]; phrases: PhraseGroup[];
}

export type Role = 'editor' | 'viewer';

export const WD = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export function pdate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}
export function fmtD(iso?: string | null): string {
  if (!iso) return '';
  const d = pdate(iso);
  return `${WD[d.getDay()]} • ${String(d.getDate()).padStart(2, '0')}/${MESES[d.getMonth()]}`;
}
export function fmtShort(iso: string): string {
  const d = pdate(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${MESES[d.getMonth()]}`;
}

export function cityColor(name: string): string {
  const n = (name || '').toLowerCase();
  if (n.includes('beijing') || n.includes('pequim')) return '#c0392b';
  if (n.includes("xi'an") || n.includes('xian')) return '#d35400';
  if (n.includes('chengdu') || n.includes('leshan')) return '#27ae60';
  if (n.includes('guilin') || n.includes('gulin') || n.includes('yangshuo')) return '#16a085';
  if (n.includes('xangai') || n.includes('shanghai') || n.includes('zhujiajiao')) return '#2471a3';
  if (n.includes('doha') || n.includes('voo') || n.includes('são paulo')) return '#7d3c98';
  return '#8a8a8a';
}
