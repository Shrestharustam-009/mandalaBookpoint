const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || './database/library.db';
const db = new Database(DB_PATH);

console.log('Checking for users...');
const users = db.prepare("SELECT * FROM users").all();
console.log('Current users in database:', users);

const adminEmail = 'admin@example.com';
const existingAdmin = db.prepare("SELECT * FROM users WHERE email = ?").get(adminEmail);

if (!existingAdmin) {
  console.log('No admin user found. Creating default admin...');
  const stmt = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
  const info = stmt.run('Admin User', adminEmail, 'admin123', 'admin');
  console.log('Admin user created successfully! ID:', info.lastInsertRowid);
  console.log('Credentials:');
  console.log('  Email: admin@example.com');
  console.log('  Password: admin123');
} else {
  console.log('Admin user already exists!');
}

db.close();
