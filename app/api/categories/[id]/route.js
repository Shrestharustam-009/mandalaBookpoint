import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db-service';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const category = await dbService.categories.getById(parseInt(id));
    
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { requireAdmin } = require('@/lib/auth');
    const admin = await requireAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });

    const { id } = await params;
    const updates = await request.json();
    const updatedCategory = await dbService.categories.update(parseInt(id), updates);
    
    if (!updatedCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { requireAdmin } = require('@/lib/auth');
    const admin = await requireAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });

    const { id } = await params;
    await dbService.categories.delete(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
