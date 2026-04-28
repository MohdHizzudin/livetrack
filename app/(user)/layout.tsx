'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import { isAdmin } from '@/lib/role';
import { MapPin, Users, Clock, Settings, LogOut, Crown } from 'lucide-react';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/');
      } else {
        const adminCheck = await isAdmin();
        setIsAdminUser(adminCheck);
      }
    });
    return unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-72 bg-white shadow-2xl flex flex-col">
        <div className="p-6 border-b flex items-center gap-3">
          <span className="text-4xl">📍</span>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">LiveTrack</h1>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-5 py-4 rounded-3xl hover:bg-indigo-50 text-gray-700 font-medium">
            <MapPin className="w-5 h-5" /> Peta Live
          </Link>
          <Link href="/groups" className="flex items-center gap-3 px-5 py-4 rounded-3xl hover:bg-indigo-50 text-gray-700 font-medium">
            <Users className="w-5 h-5" /> Kumpulan
          </Link>
          <Link href="/history" className="flex items-center gap-3 px-5 py-4 rounded-3xl hover:bg-indigo-50 text-gray-700 font-medium">
            <Clock className="w-5 h-5" /> Sejarah
          </Link>
          <Link href="/settings" className="flex items-center gap-3 px-5 py-4 rounded-3xl hover:bg-indigo-50 text-gray-700 font-medium">
            <Settings className="w-5 h-5" /> Tetapan
          </Link>
        </nav>

        {isAdminUser && (
          <Link href="/admin/dashboard" className="mx-4 mb-4 flex items-center justify-center gap-2 bg-amber-100 text-amber-700 py-4 rounded-3xl font-semibold hover:bg-amber-200">
            <Crown className="w-5 h-5" /> Admin Dashboard
          </Link>
        )}

        <div className="p-4 border-t mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 text-red-600 hover:bg-red-50 py-4 rounded-3xl font-medium"
          >
            <LogOut className="w-5 h-5" /> Log Keluar
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {children}
      </div>
    </div>
  );
}
