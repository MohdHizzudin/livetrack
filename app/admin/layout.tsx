'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import { isAdmin } from '@/lib/role';
import { ArrowLeft, LogOut, Crown } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/');
      } else {
        const adminCheck = await isAdmin();
        if (!adminCheck) {
          router.push('/dashboard'); // Redirect kalau bukan admin
        } else {
          setLoading(false);
        }
      }
    });
    return unsubscribe;
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-500">Memuatkan Admin Panel...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Admin Bar */}
      <div className="bg-white border-b shadow-sm px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-black">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Kembali ke Dashboard</span>
          </Link>
          <div className="h-6 w-px bg-gray-300"></div>
          <div className="flex items-center gap-2 text-amber-600 font-semibold">
            <Crown className="w-6 h-6" />
            ADMIN PANEL
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-6 py-3 rounded-3xl font-medium"
        >
          <LogOut className="w-5 h-5" />
          Log Keluar
        </button>
      </div>

      {/* Content Admin */}
      <div className="p-8">
        {children}
      </div>
    </div>
  );
}
