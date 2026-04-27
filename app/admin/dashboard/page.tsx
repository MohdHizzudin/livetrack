'use client';
import { useEffect, useState } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { database } from '@/lib/firebase';

export default function AdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [liveUsers, setLiveUsers] = useState<any[]>([]);

  useEffect(() => {
    onValue(ref(database, 'pendingUsers'), (snap) => {
      setPendingUsers(Object.entries(snap.val() || {}));
    });

    onValue(ref(database, 'liveLocations'), (snap) => {
      setLiveUsers(Object.values(snap.val() || {}));
    });
  }, []);

  const approveUser = (uid: string) => {
    update(ref(database, `pendingUsers/${uid}`), { status: 'approved' });
  };

  return (
    <div className="p-10 max-w-screen-2xl mx-auto">
      <h1 className="text-5xl font-bold mb-10 flex items-center gap-4">
        👑 Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Pending Users */}
        <div className="bg-white rounded-3xl p-8 shadow-xl">
          <h2 className="text-3xl font-semibold mb-6">Permohonan Baru ({pendingUsers.length})</h2>
          {pendingUsers.length === 0 ? (
            <p className="text-gray-400">Tiada permohonan baru</p>
          ) : (
            pendingUsers.map(([uid, user]: any) => (
              <div key={uid} className="flex justify-between items-center p-5 border-b last:border-none">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <button
                  onClick={() => approveUser(uid)}
                  className="bg-green-600 text-white px-8 py-3 rounded-2xl hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            ))
          )}
        </div>

        {/* Live Users */}
        <div className="bg-white rounded-3xl p-8 shadow-xl">
          <h2 className="text-3xl font-semibold mb-6">Pengguna Live Sekarang ({liveUsers.length})</h2>
          <div className="grid grid-cols-2 gap-4">
            {liveUsers.map((user: any) => (
              <div key={user.uid} className="flex items-center gap-4 bg-gray-50 p-4 rounded-3xl">
                <img src={user.photo} className="w-12 h-12 rounded-2xl" />
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-green-600">● Sedang berkongsi</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
