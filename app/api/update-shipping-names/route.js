import { NextResponse } from 'next/server';
import { execute, query } from '@/lib/database';

export async function GET() {
  try {
    // 1. Rename Kathmandu Valley to Nepal (Kathmandu Valley)
    await execute("UPDATE shipping_rates SET country = 'Nepal (Kathmandu Valley)' WHERE country = 'Kathmandu Valley'");
    
    // 2. Since we are formatting nicely, let's also ensure outside valley is Nepal (Outside Kathmandu) which it already is.

    const updatedRates = await query("SELECT * FROM shipping_rates ORDER BY country");

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully renamed shipping locations in the database.',
      rates: updatedRates
    });
  } catch (error) {
    console.error('Failed to update shipping names:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
