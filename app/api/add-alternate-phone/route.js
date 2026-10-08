import { NextResponse } from 'next/server';
import { execute, query } from '@/lib/database';

export async function GET() {
  try {
    // Check if column exists first
    const columns = await query("SHOW COLUMNS FROM orders LIKE 'alternate_phone'");
    
    if (columns.length > 0) {
      return NextResponse.json({ message: 'Column alternate_phone already exists in orders table.' });
    }

    await execute('ALTER TABLE orders ADD COLUMN alternate_phone VARCHAR(50) DEFAULT NULL');
    
    return NextResponse.json({ success: true, message: 'Successfully added alternate_phone column to orders table.' });
  } catch (error) {
    console.error('Error adding column:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
