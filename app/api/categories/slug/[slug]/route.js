import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db-service';

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const category = await dbService.categories.getBySlug(slug);
    
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
