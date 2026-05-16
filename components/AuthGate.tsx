'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { isAdmin as checkIsAdmin } from '@/lib/role';

type Props = {
  children: (ctx: { isAdmin: boolean }) => ReactNode;
};

export default function AuthGate({ children }: Props) {
  const router = useRouter();
  const { user, ready, configured } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!configured) return;
    if (!user) {
      router.replace('/');
      return;
    }
    void checkIsAdmin().then(setIsAdmin);
  }, [ready, user, configured, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <ShieldAlert className="h-10 w-10 animate-pulse text-brand-500" />
          <p className="text-sm text-gray-500">Memuatkan...</p>
        </div>
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
        <ShieldAlert className="h-12 w-12 text-amber-500" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Firebase belum dikonfigurasi</h1>
        <p className="mt-2 text-sm text-gray-600">
          Sila isi <code className="rounded bg-gray-100 px-2 py-1">.env.local</code> dengan nilai
          <code className="ml-1 rounded bg-gray-100 px-2 py-1">NEXT_PUBLIC_FIREBASE_*</code>, kemudian
          mulakan semula aplikasi.
        </p>
      </div>
    );
  }

  if (!user) return null;

  return <>{children({ isAdmin })}</>;
}
