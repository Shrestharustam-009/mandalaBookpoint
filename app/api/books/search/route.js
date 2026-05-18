import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db-service';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json([]);
    }
    
    const results = await dbService.books.search(query);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching books:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
