'use client';
import { useEffect, useState } from 'react';
import { ref, set, onValue, push } from 'firebase/database';
import { database, auth } from '@/lib/firebase';

export function useLiveLocation(isSharing: boolean) {
  const [location, setLocation] = useState({ lat: 3.1390, lng: 101.6869 });
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!auth.currentUser || !isSharing) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLoc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
          name: auth.currentUser?.displayName || 'User',
          photo: auth.currentUser?.photoURL,
          uid: auth.currentUser!.uid   // ← Fix: non-null assertion
        };

        set(ref(database, 'liveLocations/' + auth.currentUser!.uid), newLoc);
        setLocation(newLoc);

        // Simpan history setiap 30 saat
        if (Date.now() % 30000 < 1000) {
          push(ref(database, `locationHistory/${auth.currentUser!.uid}`), newLoc);
        }
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isSharing]);

  // Listen semua user yang sedang share lokasi
  useEffect(() => {
    const locRef = ref(database, 'liveLocations');
    onValue(locRef, (snap) => {
      const data = snap.val();
      setUsers(data ? Object.values(data) : []);
    });
  }, []);

  return { location, users };
}
