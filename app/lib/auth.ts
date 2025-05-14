'use client';

import { v4 as uuidv4 } from 'uuid';
import { supabase } from './supabase';

const USER_ID_COOKIE = 'finger-on-button-user-id';

/**
 * Get the current user ID from cookies or create a new one
 * Client-side version
 */
export async function getOrCreateUserIdClient(): Promise<string> {
  // Check if user is already authenticated with Supabase
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    return user.id;
  }
  
  // If not authenticated, check localStorage for anonymous ID
  let userId = localStorage.getItem(USER_ID_COOKIE);
  
  if (!userId) {
    userId = uuidv4();
    localStorage.setItem(USER_ID_COOKIE, userId);
  }
  
  return userId;
}

/**
 * Sign in anonymously with Supabase
 */
export async function signInAnonymously(): Promise<string | null> {
  const { data, error } = await supabase.auth.signInAnonymously();
  
  if (error) {
    console.error('Error signing in anonymously:', error);
    return null;
  }
  
  return data.user?.id || null;
}

/**
 * Sign out from Supabase
 */
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
  localStorage.removeItem(USER_ID_COOKIE);
} 