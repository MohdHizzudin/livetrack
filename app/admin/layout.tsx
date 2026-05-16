'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Crown, LogOut } from 'lucide-react';
import { signOutCurrentUser, useAuth } from '@/hooks/useAuth';
import { isAdmin as checkIsAdmin } from '@/lib/role';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace('/');
      return;
    }
    void checkIsAdmin().then((ok) => {
      if (!ok) {
        router.replace('/map');
      } else {
        setAllowed(true);
      }
      setLoading(false);
    });
  }, [ready, user, router]);

  if (loading || !allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          <p className="mt-3 text-sm text-gray-500">Menyemak akses admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 md:px-8">
        <div className="flex items-center gap-3">
          <Link
            href="/map"
            className="flex items-center gap-1 rounded-2xl px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Link>
          <div className="h-6 w-px bg-gray-200" />
          <div className="flex items-center gap-2 text-amber-700">
            <Crown className="h-4 w-4" />
            <span className="text-sm font-bold">Admin Panel</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void signOutCurrentUser()}
          className="inline-flex items-center gap-1 rounded-2xl px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" /> Log Keluar
        </button>
      </header>
      <div className="p-4 md:p-8">{children}</div>
    </div>
  );
}
