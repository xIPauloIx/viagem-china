'use client';
import { createContext, useContext } from 'react';
import type { TripData, Role } from '@/lib/types';

export type TabId = 'roteiro' | 'mapa' | 'calendario' | 'diaadia' | 'voos' | 'hoteis' | 'trens' | 'docs' | 'atencao' | 'frases';

export interface TripCtx {
  data: TripData;
  role: Role;
  editMode: boolean;
  /** true quando o usuário é editor E o modo edição está ligado */
  canEdit: boolean;
  /** aplica uma mutação imutável e agenda o autosave */
  mutate: (fn: (draft: TripData) => void) => void;
  goTab: (tab: TabId) => void;
  openDia: (cityId: string) => void;
  diaCity: string | null;
}

export const Ctx = createContext<TripCtx | null>(null);
export function useTrip(): TripCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useTrip fora do provider');
  return c;
}
