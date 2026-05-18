import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db-service';

export async function GET(request) {
  try {
    const subscribers = await dbService.newsletter.getAll();
    return NextResponse.json(subscribers);
  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
