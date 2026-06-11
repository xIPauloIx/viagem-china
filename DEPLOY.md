# Deploy — Viagem China 2026

App Next.js com login básico (editor/visualização), dados no Postgres Neon
(mesma instância do bolão, tabela separada `china_trip`) e exportação offline.

## Rodar local

```
npm install
npm run dev      # http://localhost:3000  (ou use a config "viagem-china" do preview, porta 3300)
```

Logins (definidos no `.env`):
- **paulo** / muralha2026 → edita tudo
- **amor** / panda2026 → só visualiza

## Publicar (GitHub + Vercel) — ~5 minutos, igual ao bolão

1. **GitHub** — criar repositório (sugestão: privado) em https://github.com/new
   com o nome `viagem-china`, sem README. Depois:

   ```
   cd C:\Users\paulo_loyall\Desktop\ClaudeCode\viagem-china
   git remote add origin https://github.com/xIPauloIx/viagem-china.git
   git push -u origin main
   ```

2. **Vercel** — https://vercel.com → Add New → Project → importar `viagem-china`.
   Em **Environment Variables**, colar estas 6 (valores no `.env` local):

   | Nome | Valor |
   |---|---|
   | `DATABASE_URL` | (copiar do `.env` — Neon São Paulo) |
   | `JWT_SECRET` | (copiar do `.env`) |
   | `EDITOR_USER` | paulo |
   | `EDITOR_PASS` | ⚠️ troque! |
   | `VIEWER_USER` | amor |
   | `VIEWER_PASS` | ⚠️ troque! |

   Deploy → pronto. O banco se cria/semeia sozinho no primeiro acesso.

3. **Atualizações futuras:** `git add -A && git commit -m "..." && git push`
   → a Vercel republica sozinha (~1-2 min).

⚠️ Commits devem usar o e-mail `moderator.vianna@gmail.com` (já configurado
neste repo via `git config user.email`) — senão a Vercel bloqueia o deploy.

## Estrutura

- `src/lib/db.ts` — Postgres (cria a tabela `china_trip` e semeia de `src/data/trip-seed.json` no 1º acesso)
- `src/lib/auth.ts` — JWT em cookie httpOnly; papéis editor/viewer
- `src/components/TripApp.tsx` — estado global, autosave (debounce 900 ms), exportação offline
- `src/components/tabs/` — Roteiro (timeline), Mapa (Leaflet + Carto), Calendário (cards/tabela),
  DiaADia, Voos, Hotéis, Trens, Atenção, Frases
- `public/offline-shell.html` — template do arquivo offline exportável (gerado por
  `Desktop\Pessoal\China\viagem-app\build.py`; o botão "⬇️ Offline" injeta os dados atuais nele)

## Dados

Fonte original: `Desktop\Pessoal\China\Calendario_China_v2 (1).xlsx`, convertido por
`Desktop\Pessoal\China\viagem-app\build.py` → `trip-seed.json`. Depois do primeiro uso,
a verdade é o banco (edições no app). Re-semear: apagar a linha
(`DELETE FROM china_trip WHERE id=1`) e recarregar o app.
