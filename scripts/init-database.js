/**
 * Database initialization script
 * Run this to set up the database schema
 * Usage: node scripts/init-database.js
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbType = process.env.DB_TYPE || 'sqlite';

async function initDatabase() {
  try {
    if (dbType === 'sqlite') {
      const Database = require('better-sqlite3');
      const dbPath = process.env.DB_PATH || './database/library.db';
      
      // Ensure database directory exists
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      
      const db = new Database(dbPath);
      db.pragma('journal_mode = WAL');
      
      // Read and execute schema
      const schemaPath = path.join(__dirname, '../database/schema.sqlite.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      // Split by semicolons and execute each statement
      const statements = schema.split(';').filter(s => s.trim().length > 0);
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            db.exec(statement);
          } catch (err) {
            // Ignore errors for existing tables/indexes
            if (!err.message.includes('already exists')) {
              console.error('Error executing statement:', err.message);
            }
          }
        }
      }
      
      console.log('✅ SQLite database initialized successfully!');
      console.log(`Database location: ${dbPath}`);
      db.close();
      
    } else if (dbType === 'mysql') {
      const mysql = require('mysql2/promise');
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'mandalauser',
        password: process.env.DB_PASSWORD || 'MandalaBook190@#89',
        database: process.env.DB_NAME || 'bookhaven',
        multipleStatements: true,
      });
      
      const schemaPath = path.join(__dirname, '../database/schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      await connection.query(schema);
      await connection.end();
      
      console.log('✅ MySQL database initialized successfully!');
      
    } else if (dbType === 'postgres') {
      const { Client } = require('pg');
      const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'bookhaven',
        port: process.env.DB_PORT || 5432,
      });
      
      await client.connect();
      
      const schemaPath = path.join(__dirname, '../database/schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      // PostgreSQL uses different syntax, so we'll need to adapt
      await client.query(schema);
      await client.end();
      
      console.log('✅ PostgreSQL database initialized successfully!');
    }
    
    console.log('\n🎉 Database setup complete! You can now start your application.');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase();
