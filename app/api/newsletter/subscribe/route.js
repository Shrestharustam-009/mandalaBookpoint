import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db-service';

export async function POST(request) {
  try {
    const { email } = await request.json();
    
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    
    await dbService.newsletter.subscribe(email);
    return NextResponse.json({ success: true, message: 'Successfully subscribed' }, { status: 201 });
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
