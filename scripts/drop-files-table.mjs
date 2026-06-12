// Remove a tabela china_files do Neon (PDFs agora vivem no Vercel Blob).
import { readFileSync } from 'node:fs';
import { Pool } from 'pg';

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8');
const url = env.match(/DATABASE_URL="([^"]+)"/)?.[1];
const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
await pool.query('DROP TABLE IF EXISTS china_files');
console.log('Tabela china_files removida do Neon.');
await pool.end();
