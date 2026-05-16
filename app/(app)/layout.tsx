'use client';
import AuthGate from '@/components/AuthGate';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      {({ isAdmin }) => (
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar isAdmin={isAdmin} />
          <div className="flex min-h-screen flex-1 flex-col pb-16 md:pb-0">
            {children}
          </div>
          <BottomNav />
        </div>
      )}
    </AuthGate>
  );
}
