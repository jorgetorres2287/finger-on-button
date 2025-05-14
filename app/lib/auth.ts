import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

const USER_ID_COOKIE = 'finger-on-button-user-id';

/**
 * Get the current user ID from cookies or create a new one
 * Client-side version
 */
export function getOrCreateUserIdClient(): string {
  let userId = localStorage.getItem(USER_ID_COOKIE);
  
  if (!userId) {
    userId = uuidv4();
    localStorage.setItem(USER_ID_COOKIE, userId);
  }
  
  return userId;
}

/**
 * Get user ID from cookies
 * Server-side version
 */
export function getUserId(): string | undefined {
  const cookieStore = cookies();
  return cookieStore.get(USER_ID_COOKIE)?.value;
}

/**
 * Set a user ID cookie
 * Server-side version
 */
export function setUserId(userId: string): void {
  const cookieStore = cookies();
  cookieStore.set(USER_ID_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
  });
} 