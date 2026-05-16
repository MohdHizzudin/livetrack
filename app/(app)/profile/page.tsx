'use client';
import { useEffect, useState } from 'react';
import { onValue, ref, remove } from 'firebase/database';
import { Bell, BellOff, LogOut, Trash2, MapPin, Crown } from 'lucide-react';
import Link from 'next/link';
import MobileHeader from '@/components/MobileHeader';
import { signOutCurrentUser, useAuth } from '@/hooks/useAuth';
import { getFirebaseDb } from '@/lib/firebase';
import { formatRelativeTime } from '@/lib/geo';
import { isAdmin as checkIsAdmin } from '@/lib/role';
import type { SosAlert } from '@/lib/types';

export default function ProfilePage() {
  const { user } = useAuth();
  const [notifPerm, setNotifPerm] = useState<NotificationPermission | 'unsupported'>('unsupported');
  const [alerts, setAlerts] = useState<Array<SosAlert & { id: string }>>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPerm(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    void checkIsAdmin().then(setIsAdmin);
    const db = getFirebaseDb();
    const sosRef = ref(db, 'sosAlerts');
    const unsub = onValue(sosRef, (snap) => {
      const data = (snap.val() ?? {}) as Record<string, SosAlert>;
      const list = Object.entries(data).map(([id, val]) => ({ ...val, id }));
      list.sort((a, b) => b.timestamp - a.timestamp);
      setAlerts(list.slice(0, 10));
    });
    return () => unsub();
  }, [user]);

  const requestNotif = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    setNotifPerm(perm);
  };

  const clearHistory = async () => {
    if (!user) return;
    const confirmed = typeof window !== 'undefined' && window.confirm(
      'Padam semua sejarah perjalanan? Tindakan ini tidak boleh dibatalkan.',
    );
    if (!confirmed) return;
    await remove(ref(getFirebaseDb(), `locationHistory/${user.uid}`));
  };

  return (
    <div className="flex flex-col">
      <MobileHeader title="Profil" subtitle={user?.displayName ?? 'Pengguna'} />
      <div className="space-y-5 p-4 md:p-8">
        <section className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100 md:p-6">
          <div className="h-16 w-16 overflow-hidden rounded-3xl ring-4 ring-brand-100">
            {user?.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoURL} alt={user.displayName ?? ''} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-brand-500 text-2xl font-bold text-white">
                {(user?.displayName ?? '?').slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold text-gray-900">{user?.displayName}</p>
            <p className="truncate text-sm text-gray-500">{user?.email}</p>
          </div>
          {isAdmin && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
              <Crown className="h-3 w-3" /> Admin
            </span>
          )}
        </section>

        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center justify-between rounded-3xl bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100"
          >
            <span className="inline-flex items-center gap-2">
              <Crown className="h-4 w-4" /> Buka Admin Dashboard
            </span>
            <span aria-hidden>→</span>
          </Link>
        )}

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Tetapan</h2>
          <div className="mt-3 space-y-2">
            <button
              type="button"
              onClick={() => void requestNotif()}
              disabled={notifPerm === 'unsupported' || notifPerm === 'granted'}
              className="flex w-full items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-60"
            >
              <span className="inline-flex items-center gap-2">
                {notifPerm === 'granted' ? (
                  <Bell className="h-4 w-4 text-emerald-600" />
                ) : (
                  <BellOff className="h-4 w-4 text-gray-500" />
                )}
                Notifikasi
              </span>
              <span className="text-xs text-gray-500">
                {notifPerm === 'granted'
                  ? 'Diaktifkan'
                  : notifPerm === 'denied'
                    ? 'Disekat'
                    : notifPerm === 'unsupported'
                      ? 'Tidak disokong'
                      : 'Ketuk untuk benarkan'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => void clearHistory()}
              className="flex w-full items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <span className="inline-flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-red-500" /> Padam sejarah perjalanan
              </span>
              <span className="text-xs text-gray-400">24 jam</span>
            </button>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <h2 className="flex items-center justify-between text-base font-semibold text-gray-900">
            <span>Amaran SOS terkini</span>
            <span className="text-xs font-medium text-gray-500">{alerts.length}</span>
          </h2>
          {alerts.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">Tiada amaran SOS direkodkan.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {alerts.map((alert) => (
                <li
                  key={alert.id}
                  className="flex items-start gap-3 rounded-2xl bg-red-50 px-3 py-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-red-900">{alert.name}</p>
                    <p className="truncate text-xs text-red-700">{alert.message}</p>
                    <p className="text-[10px] text-red-500">{formatRelativeTime(alert.timestamp)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <button
          type="button"
          onClick={() => void signOutCurrentUser()}
          className="flex w-full items-center justify-center gap-2 rounded-3xl bg-red-50 px-5 py-4 text-sm font-semibold text-red-600 hover:bg-red-100"
        >
          <LogOut className="h-4 w-4" /> Log Keluar
        </button>
      </div>
    </div>
  );
}
