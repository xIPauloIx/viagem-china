// Mede o uso de espaço no Neon (lê DATABASE_URL do .env local)
import { readFileSync } from 'node:fs';
import { Pool } from 'pg';

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8');
const url = env.match(/DATABASE_URL="([^"]+)"/)?.[1];
if (!url) { console.error('DATABASE_URL não encontrado no .env'); process.exit(1); }

const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
const db = await pool.query(
  `SELECT pg_size_pretty(pg_database_size(current_database())) AS total,
          pg_database_size(current_database()) AS bytes`);
const tables = await pool.query(
  `SELECT c.relname, pg_size_pretty(pg_total_relation_size(c.oid)) AS size,
          pg_total_relation_size(c.oid) AS bytes
   FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relkind = 'r'
   ORDER BY bytes DESC`);
const china = await pool.query(
  `SELECT pg_size_pretty(pg_total_relation_size('china_trip')) AS tabela,
          pg_size_pretty(sum(pg_column_size(data))::bigint) AS payload_json,
          count(*) AS linhas
   FROM china_trip`);

console.log('BANCO INTEIRO (neondb):', db.rows[0].total);
console.log('\nTabelas:');
for (const r of tables.rows) console.log(`  ${r.size.padStart(10)}  ${r.relname}`);
console.log('\nchina_trip:', JSON.stringify(china.rows[0]));
await pool.end();
