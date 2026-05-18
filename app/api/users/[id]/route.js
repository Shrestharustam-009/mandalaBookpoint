import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db-service';

export async function GET(request, { params }) {
  try {
    const { requireAdmin } = require('@/lib/auth');
    const admin = await requireAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });

    const { id } = await params;
    const user = await dbService.users.getById(parseInt(id));
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
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
    const updatedUser = await dbService.users.update(parseInt(id), updates);
    
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
