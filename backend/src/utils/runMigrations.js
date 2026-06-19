/* Exécute tous les fichiers .sql de database/migrations dans l'ordre alphabétique */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const dir = path.join(__dirname, '../../../database/migrations');

async function run() {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    console.log(`→ Exécution de ${file}`);
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    await pool.query(sql);
  }
  console.log('Migrations terminées.');
  await pool.end();
}

run().catch((err) => {
  console.error('Erreur migration :', err);
  process.exit(1);
});
