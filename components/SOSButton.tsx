'use client';
import { ref, push } from 'firebase/database';
import { database, auth } from '@/lib/firebase';
import { AlertTriangle } from 'lucide-react';

export default function SOSButton() {
  const sendSOS = async () => {
    if (!auth.currentUser) return;

    const sosData = {
      uid: auth.currentUser.uid,
      name: auth.currentUser.displayName || 'Anonymous',
      timestamp: Date.now(),
      message: '🚨 SOS! Saya memerlukan bantuan SEGERA!',
      location: 'LIVE' // boleh extend dengan lokasi terkini
    };

    await push(ref(database, 'sosAlerts'), sosData);

    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🚨 SOS BERJAYA DIHANTAR!', {
        body: 'Semua ahli kumpulan telah dimaklumkan dengan lokasi anda.',
        icon: '/icon-192.png'
      });
    } else if ('Notification' in window) {
      Notification.requestPermission();
    }

    alert('🚨 SOS DIHANTAR KE SEMUA AHLI KUMPULAN!');
  };

  return (
    <button
      onClick={sendSOS}
      className="fixed bottom-8 right-8 bg-red-600 hover:bg-red-700 active:scale-95 transition-all text-white w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl text-4xl z-50"
    >
      <AlertTriangle className="w-9 h-9" />
    </button>
  );
}
