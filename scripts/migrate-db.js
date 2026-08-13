require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  const dbType = process.env.DB_TYPE || 'mysql';
  
  if (dbType !== 'mysql') {
    console.log(`Database type is ${dbType}, no need to run MySQL migration.`);
    return;
  }
  
  console.log('Connecting to MySQL database...');
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'bookhaven',
      port: parseInt(process.env.DB_PORT || '3306'),
    });

    console.log('Checking for book_categories table...');
    const [tables] = await connection.execute("SHOW TABLES LIKE 'book_categories'");
    
    if (tables.length > 0) {
      console.log('Table book_categories already exists.');
    } else {
      console.log('Creating book_categories table...');
      await connection.execute(`
        CREATE TABLE \`book_categories\` (
          \`book_id\` int(11) NOT NULL,
          \`category_id\` int(11) NOT NULL,
          PRIMARY KEY (\`book_id\`,\`category_id\`),
          KEY \`category_id\` (\`category_id\`),
          CONSTRAINT \`book_categories_ibfk_1\` FOREIGN KEY (\`book_id\`) REFERENCES \`books\` (\`id\`) ON DELETE CASCADE,
          CONSTRAINT \`book_categories_ibfk_2\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\` (\`id\`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
      `);
      console.log('Successfully created book_categories table.');
    }
    
    await connection.end();
  } catch (err) {
    console.error('Migration failed:', err);
  }
}

migrate();
