/**
 * Simple authentication utilities
 * For production, integrate with bcrypt for password hashing and secure session management
 */

import { dbService } from '@/lib/db-service';

export const authUtils = {
  /**
   * Register a new user
   * Note: In production, use bcrypt for password hashing
   */
  register: async (email, password, name) => {
    const existingUser = await dbService.users.getByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const newUser = await dbService.users.create({
      email,
      password, // TODO: Hash with bcrypt in production
      name,
      role: 'user',
    });

    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    };
  },

  /**
   * Login user
   * Note: In production, use bcrypt.compare() for password verification
   */
  login: async (email, password) => {
    const user = await dbService.users.getByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    // TODO: Use bcrypt.compare() in production
    if (user.password !== password) {
      throw new Error('Invalid password');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  },

  /**
   * Get user profile
   */
  getUserProfile: async (userId) => {
    return dbService.users.getById(userId);
  },  updateProfile: async (userId, updates) => {
    const user = await dbService.users.update(userId, updates);
    return user ? {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    } : null;
  },

  /**
   * Check if user is admin
   */
  isAdmin: (user) => {
    return user && user.role === 'admin';
  },
};

/**
 * Mock session management
 * In production, use HTTP-only cookies with proper session storage
 */
export const sessionUtils = {
  createSession: (user) => {
    // Return a mock session token
    return `session_${user.id}_${Date.now()}`;
  },

  validateSession: (token) => {
    // Mock validation
    if (!token) return null;
    const parts = token.split('_');
    if (parts.length < 3) return null;
    return { userId: parseInt(parts[1]) };
  },
};

// --- JWT Server-Side Authentication ---
import { SignJWT, jwtVerify } from 'jose';

// Use a secret from env, or a fallback for development. 
// In production, MUST define JWT_SECRET in .env.local
const getJwtSecret = () => new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-fallback-key-mandala-2024');

export async function createAuthToken(user) {
  const token = await new SignJWT({ 
    id: user.id, 
    email: user.email, 
    role: user.role 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getJwtSecret());
    
  return token;
}

export async function verifyAuthToken(token) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Middleware helper for API routes.
 * Checks the auth cookie and requires 'admin' role by default.
 */
export async function requireAdmin(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
  if (!tokenMatch) return null;
  
  const token = tokenMatch[1];
  const payload = await verifyAuthToken(token);
  
  if (!payload || payload.role !== 'admin') {
    return null;
  }
  
  return payload;
}
