'use client';
import { useState } from 'react';
import LiveMap from '@/components/Map';
import { useLiveLocation } from '@/hooks/useLocation';
import SOSButton from '@/components/SOSButton';
import { Button } from '@/components/ui/button'; // jika pakai shadcn, kalau tidak guna button biasa
import { Power, PowerOff } from 'lucide-react';

export default function Dashboard() {
  const [isSharing, setIsSharing] = useState(false);
  const { location, users } = useLiveLocation(isSharing);

  return (
    <>
      {/* Top Bar */}
      <div className="h-16 bg-white border-b shadow-sm flex items-center px-8 justify-between z-10">
        <div className="flex items-center gap-3">
          <span className={`w-3 h-3 rounded-full ${isSharing ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
          <h2 className="text-xl font-semibold">
            {isSharing ? 'Sedang Berkongsi Lokasi Live' : 'Lokasi Tidak Aktif'}
          </h2>
        </div>

        <Button
          onClick={() => setIsSharing(!isSharing)}
          className={`px-8 py-6 rounded-3xl text-lg font-semibold flex items-center gap-3 ${isSharing ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
        >
          {isSharing ? <PowerOff className="w-6 h-6" /> : <Power className="w-6 h-6" />}
          {isSharing ? 'Henti Share' : 'Mulakan Live Share'}
        </Button>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <LiveMap locations={users} currentUser={location} />
      </div>

      {/* SOS Button */}
      <SOSButton />
    </>
  );
}
