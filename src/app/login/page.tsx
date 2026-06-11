'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr('');
    const r = await fetch('/api/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, pass }),
    });
    if (r.ok) { router.push('/'); router.refresh(); }
    else { setErr((await r.json()).error || 'Erro no login'); setBusy(false); }
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(160deg,#8f1b20 0%,#b3242a 55%,#d3543a 100%)' }}>
      <form onSubmit={submit}
        className="w-full max-w-sm bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 space-y-5">
        <div className="text-center space-y-1">
          <div className="text-5xl">🇨🇳</div>
          <h1 className="text-2xl font-extrabold text-zinc-900">China 2026</h1>
          <p className="text-sm text-zinc-500">30/set – 20/out · Paulo & Amor</p>
        </div>
        <div className="space-y-3">
          <input value={user} onChange={e => setUser(e.target.value)} placeholder="Usuário"
            autoCapitalize="none" autoCorrect="off"
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-china focus:border-china" />
          <input value={pass} onChange={e => setPass(e.target.value)} placeholder="Senha" type="password"
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-china focus:border-china" />
        </div>
        {err && <p className="text-sm text-red-600 text-center">{err}</p>}
        <button disabled={busy || !user || !pass}
          className="w-full rounded-xl bg-china hover:bg-china-dark disabled:opacity-50 text-white font-bold py-3 transition">
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
        <p className="text-[11px] text-center text-zinc-400">恭喜发财 — boa viagem! 🐼</p>
      </form>
    </main>
  );
}
