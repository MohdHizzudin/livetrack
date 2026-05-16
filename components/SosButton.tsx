'use client';
import { useState } from 'react';
import { push, ref } from 'firebase/database';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { getFirebaseAuth, getFirebaseDb } from '@/lib/firebase';
import type { LiveLocation } from '@/lib/types';

type Props = {
  currentLocation: LiveLocation | null;
};

export default function SosButton({ currentLocation }: Props) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const sendSos = async () => {
    const user = getFirebaseAuth().currentUser;
    if (!user) return;
    setSending(true);
    try {
      await push(ref(getFirebaseDb(), 'sosAlerts'), {
        uid: user.uid,
        name: user.displayName ?? 'Pengguna',
        photo: user.photoURL,
        lat: currentLocation?.lat ?? null,
        lng: currentLocation?.lng ?? null,
        message: 'Saya memerlukan bantuan SEGERA!',
        timestamp: Date.now(),
        resolved: false,
      });
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('SOS dihantar', {
            body: 'Semua ahli keluarga telah dimaklumkan.',
            icon: '/icons/icon-192.png',
          });
        } else if (Notification.permission !== 'denied') {
          void Notification.requestPermission();
        }
      }
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 400]);
      }
    } finally {
      setSending(false);
      setOpen(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-30 flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-2xl ring-4 ring-red-200 transition active:scale-95 md:bottom-8 md:right-8 md:h-20 md:w-20"
        aria-label="Butang Kecemasan SOS"
      >
        <AlertTriangle className="h-7 w-7 md:h-9 md:w-9" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm md:items-center">
          <div className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl md:rounded-3xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-red-700">Hantar SOS Kecemasan?</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Semua ahli keluarga dalam kumpulan anda akan menerima amaran dengan lokasi terkini anda.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <p className="font-semibold">Lokasi yang akan dikongsi:</p>
              <p className="mt-1 font-mono">
                {currentLocation
                  ? `${currentLocation.lat.toFixed(5)}, ${currentLocation.lng.toFixed(5)}`
                  : 'Lokasi tidak tersedia — pastikan Live Share dihidupkan.'}
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => void sendSos()}
                disabled={sending}
                className="flex-1 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-red-700 disabled:opacity-60"
              >
                {sending ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Menghantar...
                  </span>
                ) : (
                  'Hantar SOS sekarang'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
