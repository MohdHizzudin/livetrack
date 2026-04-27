'use client';
import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { database, auth } from '@/lib/firebase';

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const historyRef = ref(database, `locationHistory/${auth.currentUser.uid}`);
    
    onValue(historyRef, (snap) => {
      const data = snap.val();
      if (data) {
        const arr = Object.values(data).sort((a: any, b: any) => b.timestamp - a.timestamp);
        setHistory(arr.slice(0, 30)); // 30 entri terakhir
      }
    });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Sejarah Perjalanan (24 Jam)</h1>
      <div className="space-y-5">
        {history.map((entry: any, index: number) => (
          <div key={index} className="bg-white p-6 rounded-3xl shadow flex justify-between items-center">
            <div>
              <p className="font-mono text-sm">
                {entry.lat.toFixed(6)}, {entry.lng.toFixed(6)}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {new Date(entry.timestamp).toLocaleString('ms-MY')}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-emerald-100 text-emerald-700 text-xs px-4 py-2 rounded-3xl">
                Akurasi {Math.round(entry.accuracy)}m
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
