'use client';
import { useState } from 'react';
import { MapPin, Trash2, Plus, Locate } from 'lucide-react';
import MobileHeader from '@/components/MobileHeader';
import { useAuth } from '@/hooks/useAuth';
import { useGeofences } from '@/hooks/useGeofences';
import { useLiveLocation } from '@/hooks/useLocation';
import { formatRelativeTime } from '@/lib/geo';

const PRESETS = ['🏠', '🏫', '🏢', '🕌', '🏥', '🛒', '🏞️', '⛽'];

export default function PlacesPage() {
  const { user } = useAuth();
  const { current } = useLiveLocation(false);
  const { places, addPlace, deletePlace } = useGeofences(user, null);
  const [form, setForm] = useState({
    name: '',
    emoji: '🏠',
    radius: 200,
    lat: '',
    lng: '',
  });
  const [error, setError] = useState<string | null>(null);

  const useMyLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('Pelayar tidak menyokong geolokasi.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
        }));
        setError(null);
      },
      () => setError('Gagal mendapatkan lokasi semasa.'),
      { enableHighAccuracy: true },
    );
  };

  const handleAdd = async () => {
    setError(null);
    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);
    if (!form.name.trim()) {
      setError('Sila isi nama tempat.');
      return;
    }
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      setError('Koordinat tidak sah.');
      return;
    }
    if (form.radius < 50 || form.radius > 5000) {
      setError('Radius mestilah antara 50m dan 5000m.');
      return;
    }
    try {
      await addPlace({
        name: form.name.trim(),
        emoji: form.emoji,
        radius: form.radius,
        lat,
        lng,
      });
      setForm({ name: '', emoji: '🏠', radius: 200, lat: '', lng: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan tempat.');
    }
  };

  return (
    <div className="flex flex-col">
      <MobileHeader title="Tempat Selamat" subtitle="Geofence & amaran" />
      <div className="hidden border-b border-gray-100 bg-white px-8 py-4 md:block">
        <h1 className="text-2xl font-bold text-gray-900">Tempat Selamat</h1>
        <p className="text-sm text-gray-500">
          Tambah lokasi penting (rumah, sekolah, pejabat) untuk menerima notifikasi apabila ahli keluarga
          masuk atau keluar.
        </p>
      </div>

      <div className="space-y-5 p-4 md:p-8">
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Tambah Tempat Baharu</h2>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold text-gray-600">Nama tempat</span>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Rumah"
                className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-gray-600">Radius (meter)</span>
              <input
                type="number"
                min={50}
                max={5000}
                step={50}
                value={form.radius}
                onChange={(e) => setForm((p) => ({ ...p, radius: parseInt(e.target.value, 10) || 0 }))}
                className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-gray-600">Latitud</span>
              <input
                value={form.lat}
                onChange={(e) => setForm((p) => ({ ...p, lat: e.target.value }))}
                placeholder="3.139000"
                className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-gray-600">Longitud</span>
              <input
                value={form.lng}
                onChange={(e) => setForm((p) => ({ ...p, lng: e.target.value }))}
                placeholder="101.686900"
                className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
              />
            </label>
          </div>

          <div className="mt-3">
            <span className="text-xs font-semibold text-gray-600">Ikon</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRESETS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, emoji: e }))}
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl text-xl transition ${
                    form.emoji === e
                      ? 'bg-brand-100 ring-2 ring-brand-500'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mt-3 rounded-2xl bg-red-50 px-4 py-2 text-xs text-red-700">{error}</div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={useMyLocation}
              className="inline-flex items-center gap-1 rounded-2xl bg-gray-100 px-4 py-3 text-xs font-semibold text-gray-700 hover:bg-gray-200"
            >
              <Locate className="h-3.5 w-3.5" /> Gunakan lokasi saya
            </button>
            <button
              type="button"
              onClick={() => void handleAdd()}
              className="inline-flex items-center gap-1 rounded-2xl bg-brand-600 px-5 py-3 text-xs font-semibold text-white hover:bg-brand-700"
            >
              <Plus className="h-3.5 w-3.5" /> Tambah Tempat
            </button>
          </div>
        </section>

        <section>
          <h2 className="px-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Tempat saya ({places.length})
          </h2>
          {places.length === 0 ? (
            <div className="mt-3 rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center">
              <MapPin className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-3 text-sm font-medium text-gray-600">Belum ada tempat selamat.</p>
              <p className="mt-1 text-xs text-gray-400">
                Tambah rumah, sekolah, atau pejabat untuk menerima amaran masuk/keluar.
              </p>
            </div>
          ) : (
            <ul className="mt-3 grid gap-3 md:grid-cols-2">
              {places.map((place) => (
                <li
                  key={place.id}
                  className="flex items-start gap-3 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-2xl">
                    {place.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-bold text-gray-900">{place.name}</p>
                    <p className="text-xs text-gray-500">
                      {place.lat.toFixed(5)}, {place.lng.toFixed(5)} · Radius {place.radius} m
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Dicipta {formatRelativeTime(place.createdAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void deletePlace(place.id)}
                    className="rounded-2xl p-2 text-red-500 hover:bg-red-50"
                    aria-label={`Padam ${place.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
