import { NextResponse } from 'next/server';
import { authUtils } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();
    
    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const user = await authUtils.register(email, password, name);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register user' },
      { status: 400 }
    );
  }
}
