'use client';
import { useMemo, useState } from 'react';
import { Power, PowerOff, Locate, Battery, Gauge, Wifi, WifiOff } from 'lucide-react';
import MapView from '@/components/MapViewClient';
import MobileHeader from '@/components/MobileHeader';
import SosButton from '@/components/SosButton';
import { useAuth } from '@/hooks/useAuth';
import { useLiveLocation } from '@/hooks/useLocation';
import { useFamilyGroup } from '@/hooks/useFamilyGroup';
import { useFamilyLocations } from '@/hooks/useFamilyLocations';
import { useGeofences } from '@/hooks/useGeofences';
import { formatRelativeTime, formatSpeed, haversineMeters, formatDistance } from '@/lib/geo';

export default function MapPage() {
  const { user } = useAuth();
  const [isSharing, setIsSharing] = useState(false);
  const [focusUid, setFocusUid] = useState<string | null>(null);
  const { current, error, permission } = useLiveLocation(isSharing);
  const family = useFamilyGroup(user);
  const activeGroup = family.groups.find((g) => g.id === family.activeGroupId) ?? family.groups[0];
  const memberUids = useMemo(() => {
    if (!activeGroup) return null;
    return Object.keys(activeGroup.members).filter((uid) => uid !== user?.uid);
  }, [activeGroup, user]);
  const others = useFamilyLocations(memberUids);
  const { places } = useGeofences(user, current);

  const focusOnMe = () => {
    if (current) setFocusUid(current.uid);
  };

  return (
    <div className="relative flex h-screen flex-col md:h-auto md:min-h-screen">
      <MobileHeader
        title={activeGroup?.name ?? 'LiveTrack'}
        subtitle={isSharing ? 'Sedang berkongsi lokasi' : 'Lokasi tidak aktif'}
        right={
          <button
            type="button"
            onClick={() => setIsSharing(!isSharing)}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${
              isSharing
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${isSharing ? 'bg-emerald-500' : 'bg-gray-400'}`} />
            {isSharing ? 'Live' : 'Mati'}
          </button>
        }
      />

      <div className="hidden border-b border-gray-100 bg-white px-8 py-4 md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Peta Live</h1>
          <p className="text-sm text-gray-500">
            {activeGroup ? `Kumpulan: ${activeGroup.name}` : 'Tiada kumpulan aktif'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsSharing(!isSharing)}
          className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold shadow ${
            isSharing
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-emerald-500 text-white hover:bg-emerald-600'
          }`}
        >
          {isSharing ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
          {isSharing ? 'Henti Live Share' : 'Mulakan Live Share'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 px-4 py-2 text-xs text-red-700 md:px-8">
          {error}
        </div>
      )}
      {permission === 'denied' && (
        <div className="bg-amber-50 px-4 py-2 text-xs text-amber-700 md:px-8">
          Akses lokasi disekat. Sila benarkan dalam tetapan pelayar.
        </div>
      )}

      <div className="relative flex-1">
        <MapView me={current} others={others} places={places} focusUid={focusUid} />

        <button
          type="button"
          onClick={focusOnMe}
          className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand-600 shadow-lg hover:bg-brand-50 md:right-8 md:top-8"
          aria-label="Pusatkan ke lokasi saya"
        >
          <Locate className="h-5 w-5" />
        </button>

        <div className="absolute inset-x-3 bottom-3 z-10 md:inset-x-8 md:bottom-8">
          <div className="rounded-3xl bg-white/95 p-3 shadow-2xl backdrop-blur md:max-w-md md:p-4">
            {current && (
              <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <Gauge className="h-3.5 w-3.5" />
                    {formatSpeed(current.speed)}
                  </span>
                  {current.battery != null && (
                    <span className="inline-flex items-center gap-1">
                      <Battery className="h-3.5 w-3.5" />
                      {Math.round(current.battery * 100)}%
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    {permission === 'granted' ? (
                      <Wifi className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <WifiOff className="h-3.5 w-3.5 text-gray-400" />
                    )}
                    {formatRelativeTime(current.timestamp)}
                  </span>
                </div>
              </div>
            )}
            <div className="grid gap-2">
              {others.length === 0 && (
                <p className="py-1 text-center text-xs text-gray-500">
                  {activeGroup
                    ? 'Tiada ahli keluarga sedang berkongsi lokasi.'
                    : 'Sertai atau buat kumpulan keluarga di tab Keluarga.'}
                </p>
              )}
              {others.map((member) => {
                const distance = current
                  ? haversineMeters(
                      { lat: current.lat, lng: current.lng },
                      { lat: member.lat, lng: member.lng },
                    )
                  : null;
                return (
                  <button
                    key={member.uid}
                    type="button"
                    onClick={() => setFocusUid(member.uid)}
                    className="flex items-center gap-3 rounded-2xl px-2 py-2 text-left hover:bg-gray-50"
                  >
                    <div className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-emerald-400">
                      {member.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={member.photo} alt={member.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-brand-500 text-sm font-bold text-white">
                          {member.name.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">{member.name}</p>
                      <p className="truncate text-xs text-gray-500">
                        {formatSpeed(member.speed)} · {formatRelativeTime(member.timestamp)}
                      </p>
                    </div>
                    {distance != null && (
                      <span className="rounded-full bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700">
                        {formatDistance(distance)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <SosButton currentLocation={current} />
    </div>
  );
}
