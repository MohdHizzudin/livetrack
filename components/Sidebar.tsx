'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Users, Clock, MapPin, User, Crown, LogOut, ShieldAlert } from 'lucide-react';
import { signOutCurrentUser } from '@/hooks/useAuth';

const navItems = [
  { href: '/map', label: 'Peta Live', icon: Map },
  { href: '/family', label: 'Keluarga', icon: Users },
  { href: '/places', label: 'Tempat Selamat', icon: MapPin },
  { href: '/history', label: 'Sejarah', icon: Clock },
  { href: '/profile', label: 'Profil', icon: User },
];

type Props = {
  isAdmin: boolean;
};

export default function Sidebar({ isAdmin }: Props) {
  const pathname = usePathname() ?? '';
  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
      <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 text-white shadow-lg">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900">LiveTrack</p>
          <p className="text-xs text-gray-500">Pengesan Orang Tersayang</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {isAdmin && (
        <Link
          href="/admin"
          className="mx-3 mb-3 flex items-center justify-center gap-2 rounded-2xl bg-amber-100 px-4 py-3 text-sm font-semibold text-amber-700 hover:bg-amber-200"
        >
          <Crown className="h-4 w-4" /> Admin Dashboard
        </Link>
      )}

      <div className="border-t border-gray-100 p-3">
        <button
          type="button"
          onClick={() => void signOutCurrentUser()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" /> Log Keluar
        </button>
      </div>
    </aside>
  );
}
