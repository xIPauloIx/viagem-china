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
  await pool().query(`CREATE TABLE IF NOT EXISTS china_files (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'outros',
    mime TEXT,
    size INT NOT NULL,
    data BYTEA NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
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

/* ---------- arquivos (PDFs de reservas etc.) ---------- */

export async function listFiles() {
  await ensure();
  const r = await pool().query(
    `SELECT id, name, category, mime, size, created_at,
            (SELECT COALESCE(SUM(size),0) FROM china_files) AS total
     FROM china_files ORDER BY category, created_at DESC`);
  return { files: r.rows, total: Number(r.rows[0]?.total ?? 0) };
}

export async function addFile(name: string, category: string, mime: string, buf: Buffer) {
  await ensure();
  const r = await pool().query(
    `INSERT INTO china_files (name, category, mime, size, data)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [name, category, mime, buf.length, buf]);
  return r.rows[0].id as number;
}

export async function getFile(id: number) {
  await ensure();
  const r = await pool().query('SELECT name, mime, data FROM china_files WHERE id = $1', [id]);
  return r.rows[0] as { name: string; mime: string; data: Buffer } | undefined;
}

export async function deleteFile(id: number) {
  await ensure();
  await pool().query('DELETE FROM china_files WHERE id = $1', [id]);
}
