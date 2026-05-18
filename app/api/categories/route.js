import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db-service';

export async function GET(request) {
  try {
    const categories = await dbService.categories.getAll();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { requireAdmin } = require('@/lib/auth');
    const admin = await requireAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });

    const categoryData = await request.json();
    const newCategory = await dbService.categories.create(categoryData);
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
