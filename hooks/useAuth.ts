'use client';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { ref, update } from 'firebase/database';
import { getFirebaseAuth, getFirebaseDb, googleProvider, isFirebaseConfigured } from '@/lib/firebase';

export type AuthState = {
  user: User | null;
  ready: boolean;
  configured: boolean;
};

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setReady(true);
      return;
    }
    const unsub = onAuthStateChanged(getFirebaseAuth(), async (u) => {
      setUser(u);
      if (u) {
        await update(ref(getFirebaseDb(), `users/${u.uid}`), {
          uid: u.uid,
          email: u.email,
          name: u.displayName ?? 'Tanpa Nama',
          photo: u.photoURL,
          lastSeen: Date.now(),
        });
      }
      setReady(true);
    });
    return () => unsub();
  }, []);

  return { user, ready, configured: isFirebaseConfigured };
}

export async function signInWithGoogle(): Promise<void> {
  await signInWithPopup(getFirebaseAuth(), googleProvider);
}

export async function signOutCurrentUser(): Promise<void> {
  await signOut(getFirebaseAuth());
}
