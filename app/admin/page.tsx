'use client';
import { useEffect, useState } from 'react';
import { onValue, ref, update } from 'firebase/database';
import { Users, MapPin, AlertTriangle, Activity } from 'lucide-react';
import { getFirebaseDb } from '@/lib/firebase';
import { formatRelativeTime } from '@/lib/geo';
import type { LiveLocation, SosAlert } from '@/lib/types';

type AppUserRow = {
  uid: string;
  name: string;
  email: string | null;
  photo: string | null;
  role?: 'admin' | 'member';
  lastSeen?: number;
  status?: 'approved' | 'pending';
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<AppUserRow[]>([]);
  const [liveUsers, setLiveUsers] = useState<LiveLocation[]>([]);
  const [alerts, setAlerts] = useState<Array<SosAlert & { id: string }>>([]);

  useEffect(() => {
    const db = getFirebaseDb();
    const unsubUsers = onValue(ref(db, 'users'), (snap) => {
      const data = (snap.val() ?? {}) as Record<string, AppUserRow>;
      setUsers(Object.entries(data).map(([uid, v]) => ({ ...v, uid })));
    });
    const unsubLive = onValue(ref(db, 'liveLocations'), (snap) => {
      const data = (snap.val() ?? {}) as Record<string, LiveLocation>;
      setLiveUsers(Object.values(data));
    });
    const unsubAlerts = onValue(ref(db, 'sosAlerts'), (snap) => {
      const data = (snap.val() ?? {}) as Record<string, SosAlert>;
      const list = Object.entries(data).map(([id, v]) => ({ ...v, id }));
      list.sort((a, b) => b.timestamp - a.timestamp);
      setAlerts(list);
    });
    return () => {
      unsubUsers();
      unsubLive();
      unsubAlerts();
    };
  }, []);

  const promote = async (uid: string, role: 'admin' | 'member') => {
    await update(ref(getFirebaseDb(), `users/${uid}`), { role });
  };

  const resolveAlert = async (id: string) => {
    await update(ref(getFirebaseDb(), `sosAlerts/${id}`), { resolved: true });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="grid gap-3 md:grid-cols-4">
        <StatCard icon={<Users className="h-4 w-4" />} label="Pengguna" value={users.length} />
        <StatCard icon={<Activity className="h-4 w-4" />} label="Aktif live" value={liveUsers.length} />
        <StatCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="SOS belum selesai"
          value={alerts.filter((a) => !a.resolved).length}
        />
        <StatCard
          icon={<MapPin className="h-4 w-4" />}
          label="Jumlah amaran"
          value={alerts.length}
        />
      </div>

      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <h2 className="text-base font-semibold text-gray-900">Pengguna</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase text-gray-500">
              <tr>
                <th className="py-2 pr-3">Nama</th>
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Peranan</th>
                <th className="py-2 pr-3">Terakhir aktif</th>
                <th className="py-2 pr-3 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.uid}>
                  <td className="py-3 pr-3 font-medium text-gray-900">{u.name}</td>
                  <td className="py-3 pr-3 text-gray-600">{u.email ?? '—'}</td>
                  <td className="py-3 pr-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {u.role === 'admin' ? 'Admin' : 'Ahli'}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-gray-500">
                    {u.lastSeen ? formatRelativeTime(u.lastSeen) : '—'}
                  </td>
                  <td className="py-3 pr-3 text-right">
                    {u.role === 'admin' ? (
                      <button
                        type="button"
                        onClick={() => void promote(u.uid, 'member')}
                        className="rounded-xl bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                      >
                        Turunkan
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void promote(u.uid, 'admin')}
                        className="rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600"
                      >
                        Naikkan Admin
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-gray-500">
                    Tiada pengguna lagi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <h2 className="text-base font-semibold text-gray-900">Amaran SOS terkini</h2>
        {alerts.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">Tiada amaran SOS direkodkan.</p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-100">
            {alerts.map((alert) => (
              <li key={alert.id} className="flex flex-wrap items-center gap-3 py-3">
                <div
                  className={`h-3 w-3 rounded-full ${alert.resolved ? 'bg-gray-300' : 'bg-red-500 animate-pulse'}`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {alert.name} — {alert.message}
                  </p>
                  <p className="text-xs text-gray-500">
                    {alert.lat?.toFixed(5) ?? '—'}, {alert.lng?.toFixed(5) ?? '—'} ·{' '}
                    {formatRelativeTime(alert.timestamp)}
                  </p>
                </div>
                {!alert.resolved && (
                  <button
                    type="button"
                    onClick={() => void resolveAlert(alert.id)}
                    className="rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600"
                  >
                    Tandakan selesai
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
      <div className="flex items-center gap-2 text-gray-500">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
