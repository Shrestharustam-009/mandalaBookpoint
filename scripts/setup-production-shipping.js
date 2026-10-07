require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
  try {
    console.log('Connecting to database...');
    const con = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306
    });

    console.log('Creating shipping_rates table if it does not exist...');
    await con.query(`
      CREATE TABLE IF NOT EXISTS shipping_rates (
        id INT PRIMARY KEY AUTO_INCREMENT,
        country VARCHAR(255) NOT NULL,
        rate_per_kg DECIMAL(10,2) NOT NULL,
        base_rate DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Check if it's already seeded
    const [rows] = await con.query('SELECT COUNT(*) as count FROM shipping_rates');
    if (rows[0].count > 0) {
      console.log('Table already has data. Skipping seed.');
      process.exit(0);
    }

    console.log('Inserting countries and rates...');
    const rates = [
      ['Kathmandu Valley', 100], ['Nepal (Outside Kathmandu)', 150], 
      ['USA', 1500], ['Japan', 1200], ['Australia', 1500], 
      ['UK', 1500], ['Germany', 1200], ['Italy', 1200], 
      ['France', 1200], ['Hong Kong', 1200], ['Singapore', 1200], 
      ['Norway', 1200], ['Belgium', 1200], ['Thailand', 1200], 
      ['Malaysia', 1200], ['Spain', 1200], ['Sweden', 1200], ['UAE', 1200]
    ];

    for (const r of rates) {
      await con.query('INSERT INTO shipping_rates (country, rate_per_kg) VALUES (?, ?)', r);
    }

    console.log('Successfully set up production shipping rates!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to setup database:', error);
    process.exit(1);
  }
}

run();
