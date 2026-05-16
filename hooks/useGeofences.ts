'use client';
import { useEffect, useRef, useState } from 'react';
import { onValue, push, ref, remove, set } from 'firebase/database';
import type { User } from 'firebase/auth';
import { getFirebaseDb } from '@/lib/firebase';
import { haversineMeters } from '@/lib/geo';
import type { LiveLocation, SafePlace } from '@/lib/types';

export type GeofenceState = {
  places: SafePlace[];
  addPlace: (place: Omit<SafePlace, 'id' | 'createdAt'>) => Promise<void>;
  deletePlace: (id: string) => Promise<void>;
};

export function useGeofences(user: User | null, currentLocation: LiveLocation | null): GeofenceState {
  const [places, setPlaces] = useState<SafePlace[]>([]);
  const insideRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (!user) {
      setPlaces([]);
      return;
    }
    const db = getFirebaseDb();
    const placesRef = ref(db, `places/${user.uid}`);
    const unsub = onValue(placesRef, (snap) => {
      const data = (snap.val() ?? {}) as Record<string, Omit<SafePlace, 'id'>>;
      const list = Object.entries(data).map(([id, value]) => ({ ...value, id }));
      setPlaces(list);
    });
    return () => unsub();
  }, [user]);

  const placesKey = places.map((p) => p.id).join(',');
  const lat = currentLocation?.lat ?? null;
  const lng = currentLocation?.lng ?? null;

  useEffect(() => {
    if (!user || lat == null || lng == null || places.length === 0) return;
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    places.forEach((place) => {
      const distance = haversineMeters({ lat, lng }, { lat: place.lat, lng: place.lng });
      const inside = distance <= place.radius;
      const wasInside = insideRef.current[place.id] ?? false;
      if (inside !== wasInside) {
        insideRef.current[place.id] = inside;
        const eventType = inside ? 'enter' : 'exit';
        const db = getFirebaseDb();
        void push(ref(db, `geofenceEvents/${user.uid}`), {
          uid: user.uid,
          name: user.displayName ?? 'Pengguna',
          placeId: place.id,
          placeName: place.name,
          type: eventType,
          timestamp: Date.now(),
        });
        if (Notification.permission === 'granted') {
          new Notification(`${place.emoji} ${place.name}`, {
            body: inside ? `Anda telah tiba di ${place.name}.` : `Anda telah meninggalkan ${place.name}.`,
            icon: '/icons/icon-192.png',
          });
        }
      }
    });
  }, [lat, lng, placesKey, places, user]);

  const addPlace = async (place: Omit<SafePlace, 'id' | 'createdAt'>): Promise<void> => {
    if (!user) throw new Error('Sila log masuk.');
    const db = getFirebaseDb();
    const newRef = push(ref(db, `places/${user.uid}`));
    await set(newRef, { ...place, createdAt: Date.now() });
  };

  const deletePlace = async (id: string): Promise<void> => {
    if (!user) return;
    const db = getFirebaseDb();
    await remove(ref(db, `places/${user.uid}/${id}`));
  };

  return { places, addPlace, deletePlace };
}
