require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const dir = path.join(__dirname, '../../../database/seeds');

async function run() {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    console.log(`→ Seed ${file}`);
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    await pool.query(sql);
  }
  console.log('Seeds terminés.');
  await pool.end();
}

run().catch((err) => {
  console.error('Erreur seed :', err);
  process.exit(1);
});
