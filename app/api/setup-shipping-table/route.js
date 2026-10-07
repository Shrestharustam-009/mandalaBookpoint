import { NextResponse } from 'next/server';
import { execute, query } from '@/lib/database';

export async function GET() {
  try {
    console.log('Creating shipping_rates table...');
    await execute(`
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
    const rows = await query('SELECT COUNT(*) as count FROM shipping_rates');
    if (rows && rows.length > 0 && rows[0].count > 0) {
      return NextResponse.json({ success: true, message: 'Table already exists and has data. Skipping seed.' });
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
      await execute('INSERT INTO shipping_rates (country, rate_per_kg) VALUES (?, ?)', r);
    }

    return NextResponse.json({ success: true, message: 'Successfully set up production shipping rates!' });
  } catch (error) {
    console.error('Failed to setup database:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
