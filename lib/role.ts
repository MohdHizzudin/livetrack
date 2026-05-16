'use client';
import { ref, get } from 'firebase/database';
import { getFirebaseAuth, getFirebaseDb } from './firebase';

export async function isAdmin(): Promise<boolean> {
  const auth = getFirebaseAuth();
  if (!auth.currentUser) return false;
  const snap = await get(ref(getFirebaseDb(), `users/${auth.currentUser.uid}/role`));
  return snap.val() === 'admin';
}
