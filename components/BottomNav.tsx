'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Users, Clock, MapPin, User } from 'lucide-react';

const items = [
  { href: '/map', label: 'Peta', icon: Map },
  { href: '/family', label: 'Keluarga', icon: Users },
  { href: '/places', label: 'Tempat', icon: MapPin },
  { href: '/history', label: 'Sejarah', icon: Clock },
  { href: '/profile', label: 'Saya', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname() ?? '';
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/90 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition ${
                active ? 'text-brand-600' : 'text-gray-500 hover:text-brand-500'
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? 'stroke-[2.5]' : ''}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
