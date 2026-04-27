// lib/role.ts
import { auth, database } from './firebase';
import { ref, get } from 'firebase/database';

export async function isAdmin(): Promise<boolean> {
  if (!auth.currentUser) return false;
  
  const userRef = ref(database, `users/${auth.currentUser.uid}/role`);
  const snapshot = await get(userRef);
  return snapshot.val() === 'admin';
}
