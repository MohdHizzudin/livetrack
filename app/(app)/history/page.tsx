'use client';
import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { Clock, MapPin, Gauge } from 'lucide-react';
import MobileHeader from '@/components/MobileHeader';
import { useAuth } from '@/hooks/useAuth';
import { getFirebaseDb } from '@/lib/firebase';
import type { HistoryPoint } from '@/lib/types';
import { formatRelativeTime, formatSpeed } from '@/lib/geo';

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

export default function HistoryPage() {
  const { user } = useAuth();
  const [points, setPoints] = useState<HistoryPoint[]>([]);

  useEffect(() => {
    if (!user) return;
    const db = getFirebaseDb();
    const historyRef = ref(db, `locationHistory/${user.uid}`);
    const unsub = onValue(historyRef, (snap) => {
      const data = (snap.val() ?? {}) as Record<string, HistoryPoint>;
      const cutoff = Date.now() - TWENTY_FOUR_HOURS;
      const list = Object.values(data)
        .filter((p) => p.timestamp >= cutoff)
        .sort((a, b) => b.timestamp - a.timestamp);
      setPoints(list);
    });
    return () => unsub();
  }, [user]);

  return (
    <div className="flex flex-col">
      <MobileHeader title="Sejarah" subtitle="24 jam terakhir" />
      <div className="hidden border-b border-gray-100 bg-white px-8 py-4 md:block">
        <h1 className="text-2xl font-bold text-gray-900">Sejarah Perjalanan</h1>
        <p className="text-sm text-gray-500">
          Senarai titik lokasi yang dirakam dalam 24 jam terakhir.
        </p>
      </div>

      <div className="space-y-3 p-4 md:p-8">
        {points.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <Clock className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-600">Belum ada rakaman perjalanan.</p>
            <p className="mt-1 text-xs text-gray-400">
              Sejarah akan direkod secara automatik bila Live Share dihidupkan.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {points.map((p, i) => (
              <li
                key={`${p.timestamp}-${i}`}
                className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-sm text-gray-900">
                    {p.lat.toFixed(6)}, {p.lng.toFixed(6)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(p.timestamp).toLocaleString('ms-MY', { hour12: false })}
                  </p>
                  <p className="text-[10px] text-gray-400">{formatRelativeTime(p.timestamp)}</p>
                </div>
                <div className="text-right text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">
                    <Gauge className="h-3 w-3" />
                    {formatSpeed(p.speed)}
                  </span>
                  <p className="mt-1 text-gray-400">Akurasi {Math.round(p.accuracy)} m</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
