import { NextResponse } from 'next/server';
import { execute, query } from '@/lib/database';

export async function GET() {
  try {
    // Check if column exists first
    const columns = await query("SHOW COLUMNS FROM orders LIKE 'shipping_cost'");
    
    if (columns.length > 0) {
      return NextResponse.json({ message: 'Column shipping_cost already exists in orders table.' });
    }

    await execute('ALTER TABLE orders ADD COLUMN shipping_cost DECIMAL(10, 2) DEFAULT 0.00');
    
    return NextResponse.json({ success: true, message: 'Successfully added shipping_cost column to orders table.' });
  } catch (error) {
    console.error('Error adding column:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
