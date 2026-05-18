# Database Setup Guide

This project supports multiple database types: SQLite (default), MySQL, and PostgreSQL.

## Quick Start (SQLite - Recommended for Development)

SQLite is the easiest option for local development. No server setup required!

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Initialize the database:**
   ```bash
   node scripts/init-database.js
   ```

3. **Start the application:**
   ```bash
   npm run dev
   ```

The database file will be created at `./database/library.db`

## MySQL Setup

1. **Install MySQL** and create a database:
   ```sql
   CREATE DATABASE mandalabookpoint;
   ```

2. **Configure environment variables** in `.env`:
   ```env
   DB_TYPE=mysql
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=mandalabookpoint
   DB_PORT=3306
   ```

3. **Initialize the database:**
   ```bash
   node scripts/init-database.js
   ```

## PostgreSQL Setup

1. **Install PostgreSQL** and create a database:
   ```sql
   CREATE DATABASE bookhaven;
   ```

2. **Configure environment variables** in `.env`:
   ```env
   DB_TYPE=postgres
   DB_HOST=localhost
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=bookhaven
   DB_PORT=5432
   ```

3. **Initialize the database:**
   ```bash
   node scripts/init-database.js
   ```

## Database Schema

The schema includes the following tables:
- `categories` - Book categories
- `books` - Book information
- `users` - User accounts
- `reviews` - Book reviews
- `orders` - Order records
- `newsletters` - Newsletter subscribers
- `popups` - Popup notifications

See `database/schema.sql` (MySQL/PostgreSQL) or `database/schema.sqlite.sql` (SQLite) for the complete schema.

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database Type: 'sqlite', 'mysql', or 'postgres'
DB_TYPE=sqlite

# SQLite (default)
DB_PATH=./database/library.db

# MySQL/PostgreSQL (if not using SQLite)
# DB_HOST=localhost
# DB_USER=your_user
# DB_PASSWORD=your_password
# DB_NAME=bookhaven
# DB_PORT=3306  # MySQL default: 3306, PostgreSQL default: 5432
```

## Notes

- SQLite is recommended for development and small deployments
- MySQL/PostgreSQL are recommended for production
- The database automatically initializes with sample data
- All API routes are now connected to the database
- Data persists between application restarts

## Troubleshooting

**SQLite:**
- Ensure the `database` directory exists or is writable
- Check file permissions on the database file

**MySQL/PostgreSQL:**
- Verify database server is running
- Check connection credentials
- Ensure database exists before running init script
- Check firewall/network settings
