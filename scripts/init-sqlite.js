/**
 * Initialize SQLite database from schema file
 * Run: node scripts/init-sqlite.js
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || './database/library.db';
const SCHEMA_PATH = path.join(__dirname, '..', 'database', 'schema.sqlite.sql');

console.log('🗄️  Initializing SQLite database...');
console.log('   DB Path:', path.resolve(DB_PATH));
console.log('   Schema:', path.resolve(SCHEMA_PATH));

// Ensure directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Read schema
const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');

// Create/open database
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Execute entire schema at once
try {
  db.exec(schema);
} catch (err) {
  console.error(`   ❌ Error executing schema: ${err.message}`);
}

// Verify tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log('\n✅ Database initialized successfully!');
console.log(`   Tables: ${tables.map(t => t.name).join(', ')}`);

// Show row counts
for (const table of tables) {
  if (table.name.startsWith('sqlite_')) continue;
  try {
    const count = db.prepare(`SELECT COUNT(*) as c FROM ${table.name}`).get();
    console.log(`   ${table.name}: ${count.c} rows`);
  } catch (e) {
    // skip
  }
}

db.close();
console.log('\n🎉 Done! You can now run: npm run dev');
