import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db-service';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const rates = await dbService.shippingRates.getAll();
    return NextResponse.json(rates);
  } catch (error) {
    console.error('Error fetching shipping rates:', error);
    return NextResponse.json({ error: 'Failed to fetch shipping rates' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await requireAdmin(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const newRate = await dbService.shippingRates.create(data);
    
    return NextResponse.json(newRate, { status: 201 });
  } catch (error) {
    console.error('Error creating shipping rate:', error);
    return NextResponse.json({ error: 'Failed to create shipping rate' }, { status: 500 });
  }
}
