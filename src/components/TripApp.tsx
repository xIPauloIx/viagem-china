'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { TripData, Role } from '@/lib/types';
import { pdate } from '@/lib/types';
import { Ctx, type TabId } from './ctx';
import Roteiro from './tabs/Roteiro';
import Mapa from './tabs/Mapa';
import Calendario from './tabs/Calendario';
import DiaADia from './tabs/DiaADia';
import Voos from './tabs/Voos';
import Hoteis from './tabs/Hoteis';
import Trens from './tabs/Trens';
import Atencao from './tabs/Atencao';
import Frases from './tabs/Frases';
import Docs from './tabs/Docs';

const TABS: { id: TabId; label: string }[] = [
  { id: 'roteiro', label: '🧭 Roteiro' },
  { id: 'mapa', label: '🗺️ Mapa' },
  { id: 'calendario', label: '📅 Calendário' },
  { id: 'diaadia', label: '📋 Dia a dia' },
  { id: 'voos', label: '✈️ Voos' },
  { id: 'hoteis', label: '🏨 Hotéis' },
  { id: 'trens', label: '🚄 Trens' },
  { id: 'docs', label: '📎 Docs' },
  { id: 'atencao', label: '⚠️ Atenção' },
  { id: 'frases', label: '🗣️ Frases' },
];

type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

export default function TripApp({ initialData, role, user }: {
  initialData: TripData; role: Role; user: string;
}) {
  const [data, setData] = useState<TripData>(initialData);
  const [tab, setTab] = useState<TabId>('roteiro');
  const [editMode, setEditMode] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [diaCity, setDiaCity] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(data);
  latest.current = data;

  const doSave = useCallback(async () => {
    setSaveState('saving');
    try {
      const r = await fetch('/api/trip', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: latest.current }),
      });
      setSaveState(r.ok ? 'saved' : 'error');
    } catch { setSaveState('error'); }
  }, []);

  const mutate = useCallback((fn: (draft: TripData) => void) => {
    if (role !== 'editor') return;
    const next = structuredClone(latest.current);
    fn(next);
    setData(next);
    latest.current = next;
    setSaveState('dirty');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(doSave, 900);
  }, [role, doSave]);

  // visualizadora: busca a versão mais recente quando o app volta ao foco
  useEffect(() => {
    if (role === 'editor') return;
    const refresh = async () => {
      try {
        const r = await fetch('/api/trip');
        if (r.ok) {
          const j = await r.json();
          if (j.data?.savedAt !== latest.current.savedAt) setData(j.data);
        }
      } catch { /* offline — mantém o que tem */ }
    };
    const onVis = () => { if (document.visibilityState === 'visible') refresh(); };
    document.addEventListener('visibilitychange', onVis);
    const iv = setInterval(refresh, 90_000);
    return () => { document.removeEventListener('visibilitychange', onVis); clearInterval(iv); };
  }, [role]);

  async function exportOffline() {
    const shell = await (await fetch('/offline-shell.html')).text();
    const payload = JSON.stringify({ ...latest.current, savedAt: new Date().toISOString() })
      .replace(/<\//g, '<\\/');
    const html = shell.replace('__APP_DATA__', payload);
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Viagem_China_offline.html';
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 800);
  }

  async function logout() {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  const start = pdate('2026-09-30');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const daysLeft = Math.ceil((start.getTime() - today.getTime()) / 864e5);

  const saveLabel = {
    idle: '', dirty: '· alterações pendentes', saving: '· salvando…',
    saved: '· salvo na nuvem ✓', error: '· ⚠️ erro ao salvar — verifique a internet',
  }[saveState];

  return (
    <Ctx.Provider value={{
      data, role, editMode, canEdit: role === 'editor' && editMode, mutate,
      goTab: setTab, diaCity,
      openDia: (cityId) => { setDiaCity(cityId); setTab('diaadia'); },
    }}>
      <div className="min-h-dvh">
        <header className="sticky top-0 z-[1100] bg-gradient-to-r from-china-dark to-china text-white shadow-lg">
          <div className="max-w-6xl mx-auto px-4 pt-3 pb-0">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-lg font-extrabold tracking-tight leading-tight">🇨🇳 China 2026</h1>
                <p className="text-[11.5px] text-white/75 truncate">
                  30/set – 20/out {daysLeft > 0 ? `· ⏳ faltam ${daysLeft} dias` : daysLeft > -22 ? '· ✈️ em viagem!' : ''} {saveLabel}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {role === 'editor' && (
                  <button onClick={() => setEditMode(e => !e)}
                    className={`rounded-lg px-3 py-1.5 text-[13px] font-bold border transition cursor-pointer
                      ${editMode ? 'bg-gold text-amber-950 border-gold' : 'bg-white/10 border-white/30 hover:bg-white/20'}`}>
                    {editMode ? '✅ Pronto' : '✏️ Editar'}
                  </button>
                )}
                <button onClick={exportOffline} title="Baixar versão offline (celular)"
                  className="rounded-lg px-3 py-1.5 text-[13px] font-semibold bg-white/10 border border-white/30 hover:bg-white/20 transition cursor-pointer">
                  ⬇️ Offline
                </button>
                <button onClick={logout} title={`Sair (${user})`}
                  className="rounded-lg px-2.5 py-1.5 text-[13px] bg-white/10 border border-white/30 hover:bg-white/20 transition cursor-pointer">
                  ⎋
                </button>
              </div>
            </div>
            <nav className="flex gap-1 mt-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`shrink-0 rounded-t-xl px-3.5 py-2 text-[13px] font-semibold transition cursor-pointer
                    ${tab === t.id ? 'bg-paper text-china' : 'text-white/80 hover:bg-white/10'}`}>
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-5 pb-24">
          {role === 'viewer' && tab === 'roteiro' && (
            <div className="mb-4 text-[12.5px] text-zinc-500 bg-white border border-inkline rounded-xl px-4 py-2">
              👀 Você está no modo visualização — o Paulo edita e tudo aparece aqui automaticamente. 💛
            </div>
          )}
          {tab === 'roteiro' && <Roteiro />}
          {tab === 'mapa' && <Mapa />}
          {tab === 'calendario' && <Calendario />}
          {tab === 'diaadia' && <DiaADia />}
          {tab === 'voos' && <Voos />}
          {tab === 'hoteis' && <Hoteis />}
          {tab === 'trens' && <Trens />}
          {tab === 'docs' && <Docs />}
          {tab === 'atencao' && <Atencao />}
          {tab === 'frases' && <Frases />}
        </main>
      </div>
    </Ctx.Provider>
  );
}
