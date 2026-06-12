// Patch v2: adiciona dias de ida/volta, trechos do mapa (legs) e remove frase de
// alergia — preservando as edições já feitas no banco.
import { readFileSync } from 'node:fs';
import { Pool } from 'pg';

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8');
const url = env.match(/DATABASE_URL="([^"]+)"/)?.[1];
const seed = JSON.parse(readFileSync(new URL('../src/data/trip-seed.json', import.meta.url), 'utf8'));

const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
const r = await pool.query('SELECT data FROM china_trip WHERE id = 1');
if (!r.rows.length) { console.log('Sem linha no banco — nada a fazer (seed novo já tem tudo).'); process.exit(0); }
const data = r.rows[0].data;

const changes = [];

// 1. cidades de trânsito (ida no início, volta no fim)
const ida = seed.cities.find(c => c.id === 'ida');
const volta = seed.cities.find(c => c.id === 'volta');
if (!data.cities.some(c => c.id === 'ida')) { data.cities.unshift(ida); changes.push('+ cidade ✈️ Ida'); }
if (!data.cities.some(c => c.id === 'volta')) { data.cities.push(volta); changes.push('+ cidade ✈️ Volta'); }

// 2. trechos do mapa
data.legs = seed.legs;
changes.push(`legs: ${seed.legs.length} trechos`);

// 3. remover frase de alergia a amendoim
for (const g of data.phrases) {
  const before = g.items.length;
  g.items = g.items.filter(p => !/amendoim/i.test(p.pt));
  if (g.items.length < before) changes.push('- frase alergia amendoim');
}

data.version = 2;
data.savedAt = new Date().toISOString();
await pool.query('UPDATE china_trip SET data = $1, saved_at = now() WHERE id = 1', [JSON.stringify(data)]);
console.log('Patch aplicado:', changes.join(' | '));
console.log(`cidades agora: ${data.cities.map(c => c.id).join(', ')}`);
await pool.end();
