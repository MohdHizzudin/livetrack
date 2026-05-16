'use client';
import { useEffect, useRef, useState } from 'react';
import { ref, set, push, serverTimestamp, remove } from 'firebase/database';
import { getFirebaseAuth, getFirebaseDb } from '@/lib/firebase';
import type { LiveLocation } from '@/lib/types';
import { useBattery } from './useBattery';

export type LiveLocationState = {
  current: LiveLocation | null;
  error: string | null;
  permission: PermissionState | 'unknown';
};

const HISTORY_INTERVAL_MS = 30_000;

export function useLiveLocation(isSharing: boolean): LiveLocationState {
  const [current, setCurrent] = useState<LiveLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<PermissionState | 'unknown'>('unknown');
  const battery = useBattery();
  const lastHistoryAt = useRef(0);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.permissions) return;
    navigator.permissions
      .query({ name: 'geolocation' as PermissionName })
      .then((status) => {
        setPermission(status.state);
        status.onchange = () => setPermission(status.state);
      })
      .catch(() => {
        /* not supported */
      });
  }, []);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const me = auth.currentUser;
    if (!me) return;
    const db = getFirebaseDb();
    const liveRef = ref(db, `liveLocations/${me.uid}`);

    if (!isSharing) {
      void set(liveRef, null);
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('Pelayar ini tidak menyokong geolokasi.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setError(null);
        const loc: LiveLocation = {
          uid: me.uid,
          name: me.displayName ?? 'Pengguna',
          photo: me.photoURL,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed ?? null,
          heading: position.coords.heading ?? null,
          battery: battery.level,
          charging: battery.charging,
          isSharing: true,
          timestamp: Date.now(),
        };
        setCurrent(loc);
        void set(liveRef, { ...loc, serverTime: serverTimestamp() });

        if (Date.now() - lastHistoryAt.current >= HISTORY_INTERVAL_MS) {
          lastHistoryAt.current = Date.now();
          void push(ref(db, `locationHistory/${me.uid}`), {
            lat: loc.lat,
            lng: loc.lng,
            accuracy: loc.accuracy,
            speed: loc.speed,
            timestamp: loc.timestamp,
          });
        }
      },
      (err) => {
        setError(err.message || 'Tidak dapat mengakses lokasi.');
      },
      { enableHighAccuracy: true, maximumAge: 5_000, timeout: 30_000 },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      void remove(liveRef);
    };
  }, [isSharing, battery.level, battery.charging]);

  return { current, error, permission };
}
