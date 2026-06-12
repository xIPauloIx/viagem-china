import { Pool } from 'pg';
import seed from '@/data/trip-seed.json';
import type { TripData } from './types';

declare global {
  // eslint-disable-next-line no-var
  var _chinaPool: Pool | undefined;
}

function pool(): Pool {
  if (!global._chinaPool) {
    global._chinaPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 3,
      ssl: { rejectUnauthorized: false },
    });
  }
  return global._chinaPool;
}

let ensured = false;
async function ensure() {
  if (ensured) return;
  await pool().query(`CREATE TABLE IF NOT EXISTS china_trip (
    id INT PRIMARY KEY,
    data JSONB NOT NULL,
    saved_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`);
  ensured = true;
}

export async function getTrip(): Promise<TripData> {
  await ensure();
  const r = await pool().query('SELECT data FROM china_trip WHERE id = 1');
  if (r.rows.length) return r.rows[0].data as TripData;
  const data = seed as unknown as TripData;
  await saveTrip(data);
  return data;
}

export async function saveTrip(data: TripData): Promise<void> {
  await ensure();
  data.savedAt = new Date().toISOString();
  await pool().query(
    `INSERT INTO china_trip (id, data, saved_at) VALUES (1, $1, now())
     ON CONFLICT (id) DO UPDATE SET data = $1, saved_at = now()`,
    [JSON.stringify(data)]
  );
}

// Arquivos (PDFs de reservas etc.) ficam no Vercel Blob — ver src/lib/files.ts.
// Decisão: nada de binário no Neon (limite de 512 MB é compartilhado com outros projetos).
