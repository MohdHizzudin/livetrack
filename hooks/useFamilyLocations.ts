'use client';
import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { getFirebaseDb } from '@/lib/firebase';
import type { LiveLocation } from '@/lib/types';

export function useFamilyLocations(memberUids: string[] | null): LiveLocation[] {
  const [locations, setLocations] = useState<LiveLocation[]>([]);
  const memberKey = memberUids ? memberUids.join(',') : '';

  useEffect(() => {
    if (!memberKey) {
      setLocations([]);
      return;
    }
    const uids = memberKey.split(',');
    const db = getFirebaseDb();
    const liveRef = ref(db, 'liveLocations');
    const unsub = onValue(liveRef, (snap) => {
      const data = (snap.val() ?? {}) as Record<string, LiveLocation>;
      const filtered = uids
        .map((uid) => data[uid])
        .filter((entry): entry is LiveLocation => Boolean(entry));
      setLocations(filtered);
    });
    return () => unsub();
  }, [memberKey]);

  return locations;
}
