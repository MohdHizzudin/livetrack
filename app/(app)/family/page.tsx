'use client';
import { useState } from 'react';
import { Users, Copy, Check, LogOut, UserPlus, Plus, Shield } from 'lucide-react';
import MobileHeader from '@/components/MobileHeader';
import { useAuth } from '@/hooks/useAuth';
import { useFamilyGroup } from '@/hooks/useFamilyGroup';
import { formatRelativeTime } from '@/lib/geo';

export default function FamilyPage() {
  const { user } = useAuth();
  const family = useFamilyGroup(user);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreate = async () => {
    setError(null);
    if (!newGroupName.trim()) {
      setError('Sila isi nama kumpulan.');
      return;
    }
    try {
      const created = await family.createGroup(newGroupName.trim());
      family.setActiveGroupId(created.id);
      setNewGroupName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mencipta kumpulan.');
    }
  };

  const handleJoin = async () => {
    setError(null);
    if (!joinCode.trim()) {
      setError('Sila masukkan kod jemputan.');
      return;
    }
    try {
      const joined = await family.joinGroupByCode(joinCode);
      if (!joined) {
        setError('Kod jemputan tidak sah.');
        return;
      }
      family.setActiveGroupId(joined.id);
      setJoinCode('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyertai kumpulan.');
    }
  };

  const handleCopy = async (code: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    }
  };

  return (
    <div className="flex flex-col">
      <MobileHeader title="Keluarga" subtitle="Kumpulan & ahli" />
      <div className="hidden border-b border-gray-100 bg-white px-8 py-4 md:block">
        <h1 className="text-2xl font-bold text-gray-900">Kumpulan Keluarga</h1>
        <p className="text-sm text-gray-500">
          Cipta kumpulan dan jemput ahli keluarga menggunakan kod 6-aksara.
        </p>
      </div>

      <div className="space-y-5 p-4 md:p-8">
        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <Plus className="h-4 w-4" /> Cipta Kumpulan Baru
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Anda akan menjadi pemilik kumpulan. Jemput ahli melalui kod jemputan.
            </p>
            <div className="mt-4 flex gap-2">
              <input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Contoh: Keluarga Saya"
                className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => void handleCreate()}
                className="rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Cipta
              </button>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <UserPlus className="h-4 w-4" /> Sertai Kumpulan
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Masukkan kod jemputan 6 aksara daripada ahli keluarga anda.
            </p>
            <div className="mt-4 flex gap-2">
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Contoh: AB23XY"
                maxLength={6}
                className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-sm uppercase tracking-widest focus:border-brand-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => void handleJoin()}
                className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Sertai
              </button>
            </div>
          </section>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <section>
          <h2 className="px-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Kumpulan saya ({family.groups.length})
          </h2>
          {family.groups.length === 0 ? (
            <div className="mt-3 rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center">
              <Users className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-3 text-sm font-medium text-gray-600">
                Anda belum berada dalam mana-mana kumpulan keluarga.
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Cipta baharu atau sertai menggunakan kod jemputan.
              </p>
            </div>
          ) : (
            <ul className="mt-3 grid gap-3 md:grid-cols-2">
              {family.groups.map((group) => {
                const members = Object.values(group.members);
                const isActive = family.activeGroupId === group.id;
                const isOwner = group.createdBy === user?.uid;
                return (
                  <li
                    key={group.id}
                    className={`rounded-3xl bg-white p-5 shadow-sm ring-1 transition ${
                      isActive ? 'ring-brand-500' : 'ring-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-bold text-gray-900">{group.name}</p>
                        <p className="text-xs text-gray-500">
                          {members.length} ahli · Dicipta {formatRelativeTime(group.createdAt)}
                        </p>
                      </div>
                      {isOwner && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                          <Shield className="h-3 w-3" /> Pemilik
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between rounded-2xl bg-gray-50 px-3 py-2">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-500">
                          Kod Jemputan
                        </p>
                        <p className="font-mono text-lg font-bold tracking-widest text-gray-900">
                          {group.inviteCode}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleCopy(group.inviteCode, group.id)}
                        className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100"
                      >
                        {copiedId === group.id ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-600" /> Disalin
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" /> Salin
                          </>
                        )}
                      </button>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {members.slice(0, 6).map((m) => (
                        <div
                          key={m.uid}
                          className="flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1.5"
                        >
                          {m.photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={m.photo}
                              alt={m.name}
                              className="h-5 w-5 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
                              {m.name.slice(0, 1).toUpperCase()}
                            </div>
                          )}
                          <span className="text-xs font-medium text-gray-700">
                            {m.name.split(' ')[0]}
                            {m.role === 'owner' && ' ★'}
                          </span>
                        </div>
                      ))}
                      {members.length > 6 && (
                        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-500">
                          +{members.length - 6}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => family.setActiveGroupId(group.id)}
                        className={`flex-1 rounded-2xl px-4 py-2 text-xs font-semibold ${
                          isActive
                            ? 'bg-brand-100 text-brand-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {isActive ? 'Aktif' : 'Pilih aktif'}
                      </button>
                      <button
                        type="button"
                        onClick={() => void family.leaveGroup(group.id)}
                        className="inline-flex items-center gap-1 rounded-2xl bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
                      >
                        <LogOut className="h-3.5 w-3.5" /> Keluar
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
