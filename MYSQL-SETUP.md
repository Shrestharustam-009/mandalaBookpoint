# MySQL Database Setup Guide

## Quick Setup

### 1. Create MySQL Database

First, create the database in MySQL:

```sql
CREATE DATABASE mandalabookpoint CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory with:

```env
DB_TYPE=mysql
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=mandalabookpoint
DB_PORT=3306
```

### 3. Initialize Database Schema

Run the initialization script:

```bash
node scripts/init-database.js
```

This will:
- Create all tables
- Set up indexes
- Insert sample data

### 4. Start the Application

```bash
npm run dev
```

## Manual Setup (Alternative)

If the script doesn't work, you can manually run the SQL:

1. **Connect to MySQL:**
   ```bash
   mysql -u root -p
   ```

2. **Select the database:**
   ```sql
   USE mandalabookpoint;
   ```

3. **Run the schema file:**
   ```bash
   mysql -u root -p mandalabookpoint < database/schema.sql
   ```

## Troubleshooting

### "Cannot connect to MySQL server"
- Ensure MySQL is running: `sudo service mysql start` (Linux) or check MySQL service (Windows)
- Verify credentials in `.env` file
- Check if MySQL is listening on the correct port (default: 3306)

### "Access denied for user"
- Check username and password in `.env`
- Ensure user has privileges: `GRANT ALL PRIVILEGES ON mandalabookpoint.* TO 'root'@'localhost';`

### "Unknown database 'mandalabookpoint'"
- Create the database first: `CREATE DATABASE mandalabookpoint;`

### "Table already exists"
- This is normal if you've run the script before
- The script uses `CREATE TABLE IF NOT EXISTS` so it's safe to run multiple times

## MySQL Version Requirements

- MySQL 5.7+ or MariaDB 10.2+ (for JSON support)
- For older versions, you may need to change `tags JSON` to `tags TEXT` in the schema

## Connection Pooling

The current setup uses a single connection. For production, consider using a connection pool:

```javascript
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

## Testing the Connection

You can test your MySQL connection by running:

```bash
node -e "require('dotenv').config(); const mysql = require('mysql2/promise'); (async () => { const conn = await mysql.createConnection({host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME}); console.log('Connected!'); await conn.end(); })()"
```
