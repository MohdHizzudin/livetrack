'use client';
import { ShieldAlert } from 'lucide-react';
import type { ReactNode } from 'react';

type Props = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
};

export default function MobileHeader({ title, subtitle, right }: Props) {
  return (
    <header className="flex items-center justify-between border-b border-gray-100 bg-white/90 px-4 py-3 backdrop-blur md:hidden">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 text-white">
          <ShieldAlert className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight text-gray-900">{title}</p>
          {subtitle && <p className="text-xs leading-tight text-gray-500">{subtitle}</p>}
        </div>
      </div>
      {right}
    </header>
  );
}
