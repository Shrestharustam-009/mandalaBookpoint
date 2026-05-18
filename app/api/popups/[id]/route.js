import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db-service';

export async function PUT(request, { params }) {
  try {
    const { requireAdmin } = require('@/lib/auth');
    const admin = await requireAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });

    const { id } = await params;
    const updates = await request.json();
    const updatedPopup = await dbService.popups.update(parseInt(id), updates);
    
    if (!updatedPopup) {
      return NextResponse.json({ error: 'Popup not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedPopup);
  } catch (error) {
    console.error('Error updating popup:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { requireAdmin } = require('@/lib/auth');
    const admin = await requireAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });

    const { id } = await params;
    await dbService.popups.delete(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting popup:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
