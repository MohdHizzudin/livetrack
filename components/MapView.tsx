'use client';
import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LiveLocation, SafePlace } from '@/lib/types';
import { formatRelativeTime, formatSpeed } from '@/lib/geo';

const DEFAULT_CENTER: [number, number] = [3.139, 101.6869];

function avatarIcon(url: string | null, isMe: boolean): L.DivIcon {
  const size = isMe ? 52 : 44;
  const ring = isMe ? 'ring-brand-500' : 'ring-emerald-400';
  const initial = '?';
  const inner = url
    ? `<img src="${url}" alt="" class="w-full h-full object-cover" />`
    : `<div class="w-full h-full flex items-center justify-center bg-brand-500 text-white text-lg font-bold">${initial}</div>`;
  return L.divIcon({
    className: '',
    html: `
      <div class="relative" style="width:${size}px;height:${size}px;">
        ${isMe ? '<div class="absolute inset-0 rounded-full bg-brand-400/40 animate-pulse-ring"></div>' : ''}
        <div class="relative w-full h-full rounded-full overflow-hidden ring-4 ${ring} ring-offset-2 ring-offset-white shadow-lg bg-white">
          ${inner}
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function Recenter({ target }: { target: [number, number] | null }) {
  const map = useMap();
  const lat = target?.[0] ?? null;
  const lng = target?.[1] ?? null;
  useEffect(() => {
    if (lat != null && lng != null) {
      map.flyTo([lat, lng], Math.max(map.getZoom(), 15), { duration: 0.8 });
    }
  }, [lat, lng, map]);
  return null;
}

type Props = {
  me: LiveLocation | null;
  others: LiveLocation[];
  places?: SafePlace[];
  focusUid?: string | null;
};

export default function MapView({ me, others, places = [], focusUid }: Props) {
  const meLat = me?.lat;
  const meLng = me?.lng;
  const firstOther = others[0];
  const center = useMemo<[number, number]>(() => {
    if (meLat != null && meLng != null) return [meLat, meLng];
    if (firstOther) return [firstOther.lat, firstOther.lng];
    return DEFAULT_CENTER;
  }, [meLat, meLng, firstOther]);

  const focusTarget = useMemo<[number, number] | null>(() => {
    if (!focusUid) return null;
    if (me && me.uid === focusUid) return [me.lat, me.lng];
    const other = others.find((o) => o.uid === focusUid);
    return other ? [other.lat, other.lng] : null;
  }, [focusUid, me, others]);

  return (
    <MapContainer
      center={center}
      zoom={15}
      scrollWheelZoom
      className="h-full w-full"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {places.map((place) => (
        <Circle
          key={place.id}
          center={[place.lat, place.lng]}
          radius={place.radius}
          pathOptions={{ color: '#6366f1', fillColor: '#6366f1', fillOpacity: 0.1, weight: 2 }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">
                {place.emoji} {place.name}
              </p>
              <p className="text-gray-500">Radius {place.radius} m</p>
            </div>
          </Popup>
        </Circle>
      ))}

      {me && (
        <Marker position={[me.lat, me.lng]} icon={avatarIcon(me.photo, true)}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{me.name} (Saya)</p>
              <p>{formatSpeed(me.speed)}</p>
              <p className="text-gray-500">{formatRelativeTime(me.timestamp)}</p>
            </div>
          </Popup>
        </Marker>
      )}

      {others.map((user) => (
        <Marker key={user.uid} position={[user.lat, user.lng]} icon={avatarIcon(user.photo, false)}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{user.name}</p>
              <p>{formatSpeed(user.speed)}</p>
              <p className="text-gray-500">{formatRelativeTime(user.timestamp)}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      <Recenter target={focusTarget} />
    </MapContainer>
  );
}
