/**
 * Database connection and query utilities
 * Supports MySQL, PostgreSQL, and SQLite
 */

let db = null;
let dbType = process.env.DB_TYPE || 'mysql'; // 'mysql', 'postgres', 'sqlite'

// Initialize database connection
export async function initDatabase() {
  // Don't initialize in browser
  if (typeof window !== 'undefined') {
    throw new Error('Database can only be initialized on the server');
  }
  
  // Ensure we're on the server
  if (typeof process === 'undefined' || !process.env) {
    throw new Error('Database can only be initialized on the server');
  }
  
  if (db) return db;

  try {
    if (dbType === 'mysql') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mysql = require('mysql2/promise');
      db = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'mandalauser',
        password: process.env.DB_PASSWORD || 'MandalaBook190@#89',
        database: process.env.DB_NAME || 'bookhaven',
        port: parseInt(process.env.DB_PORT || '3306'),
      });
      return db;
    } else if (dbType === 'postgres') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Pool } = require('pg');
      db = new Pool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'bookhaven',
        port: parseInt(process.env.DB_PORT || '5432'),
      });
      return db;
    } else if (dbType === 'sqlite') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Database = require('better-sqlite3');
      const dbPath = process.env.DB_PATH || './database/library.db';
      db = new Database(dbPath);
      db.pragma('journal_mode = WAL');

      // Auto-migration: Ensure books table has weight column if it exists
      try {
        const columns = db.prepare("PRAGMA table_info(books)").all();
        const hasWeight = columns.some(c => c.name === 'weight');
        if (!hasWeight) {
          db.prepare("ALTER TABLE books ADD COLUMN weight REAL").run();
          console.log("[Auto-Migration] Added weight column to books table in library.db successfully!");
        }
      } catch (err) {
        console.error("[Auto-Migration] Failed to run auto-migration for weight column:", err);
      }

      return db;
    }
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

// Get database instance
export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

// Execute query (handles different database types)
export async function query(sql, params = []) {
  const database = await initDatabase();
  
  try {
    if (dbType === 'mysql') {
      const [results] = await database.execute(sql, params);
      return results;
    } else if (dbType === 'postgres') {
      const result = await database.query(sql, params);
      return result.rows;
    } else if (dbType === 'sqlite') {
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        const stmt = database.prepare(sql);
        return stmt.all(...params);
      } else {
        const stmt = database.prepare(sql);
        const result = stmt.run(...params);
        return { insertId: result.lastInsertRowid, affectedRows: result.changes };
      }
    }
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

// Execute insert and return inserted ID
export async function insert(sql, params = []) {
  const database = await initDatabase();
  
  try {
    if (dbType === 'mysql') {
      const [result] = await database.execute(sql, params);
      return result.insertId;
    } else if (dbType === 'postgres') {
      const result = await database.query(sql + ' RETURNING id', params);
      return result.rows[0].id;
    } else if (dbType === 'sqlite') {
      const stmt = database.prepare(sql);
      const result = stmt.run(...params);
      return result.lastInsertRowid;
    }
  } catch (error) {
    console.error('Insert error:', error);
    throw error;
  }
}

// Execute update/delete and return affected rows
export async function execute(sql, params = []) {
  const database = await initDatabase();
  
  try {
    if (dbType === 'mysql') {
      const [result] = await database.execute(sql, params);
      return { affectedRows: result.affectedRows };
    } else if (dbType === 'postgres') {
      const result = await database.query(sql, params);
      return { affectedRows: result.rowCount };
    } else if (dbType === 'sqlite') {
      const stmt = database.prepare(sql);
      const result = stmt.run(...params);
      return { affectedRows: result.changes };
    }
  } catch (error) {
    console.error('Execute error:', error);
    throw error;
  }
}

// Close database connection
export async function closeDatabase() {
  if (db) {
    if (dbType === 'mysql') {
      await db.end();
    } else if (dbType === 'postgres') {
      await db.end();
    } else if (dbType === 'sqlite') {
      db.close();
    }
    db = null;
  }
}
