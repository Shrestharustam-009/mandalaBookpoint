import { NextResponse } from 'next/server';
import { authUtils } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await authUtils.login(email, password);
    const { createAuthToken } = require('@/lib/auth');
    const token = await createAuthToken(user);
    
    const response = NextResponse.json(user, { status: 200 });
    
    // Set HTTP-Only cookie for API security
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Error logging in user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to login' },
      { status: 401 }
    );
  }
}
