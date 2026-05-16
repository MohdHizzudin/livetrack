'use client';
import { useEffect, useState } from 'react';
import { onValue, push, ref, set, update, remove, get } from 'firebase/database';
import type { User } from 'firebase/auth';
import { getFirebaseDb } from '@/lib/firebase';
import { generateInviteCode } from '@/lib/geo';
import type { FamilyGroup, GroupMember } from '@/lib/types';

export type FamilyState = {
  groups: FamilyGroup[];
  activeGroupId: string | null;
  setActiveGroupId: (id: string) => void;
  createGroup: (name: string) => Promise<FamilyGroup>;
  joinGroupByCode: (code: string) => Promise<FamilyGroup | null>;
  leaveGroup: (groupId: string) => Promise<void>;
};

export function useFamilyGroup(user: User | null): FamilyState {
  const [groups, setGroups] = useState<FamilyGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setGroups([]);
      return;
    }
    const db = getFirebaseDb();
    const groupsRef = ref(db, 'groups');
    const unsub = onValue(groupsRef, (snap) => {
      const data = (snap.val() ?? {}) as Record<string, FamilyGroup>;
      const mine = Object.entries(data)
        .filter(([, group]) => group.members && group.members[user.uid])
        .map(([id, group]) => ({ ...group, id }));
      setGroups(mine);
      setActiveGroupId((current) => current ?? mine[0]?.id ?? null);
    });
    return () => unsub();
  }, [user]);

  const createGroup = async (name: string): Promise<FamilyGroup> => {
    if (!user) throw new Error('Sila log masuk dahulu.');
    const db = getFirebaseDb();
    const newRef = push(ref(db, 'groups'));
    const member: GroupMember = {
      uid: user.uid,
      name: user.displayName ?? 'Pengguna',
      photo: user.photoURL,
      joinedAt: Date.now(),
      role: 'owner',
    };
    const group: Omit<FamilyGroup, 'id'> = {
      name,
      inviteCode: generateInviteCode(),
      createdBy: user.uid,
      createdAt: Date.now(),
      members: { [user.uid]: member },
    };
    await set(newRef, group);
    return { ...group, id: newRef.key! };
  };

  const joinGroupByCode = async (code: string): Promise<FamilyGroup | null> => {
    if (!user) throw new Error('Sila log masuk dahulu.');
    const cleanCode = code.trim().toUpperCase();
    const db = getFirebaseDb();
    const snap = await get(ref(db, 'groups'));
    const data = (snap.val() ?? {}) as Record<string, FamilyGroup>;
    const match = Object.entries(data).find(([, g]) => g.inviteCode === cleanCode);
    if (!match) return null;
    const [id, group] = match;
    const member: GroupMember = {
      uid: user.uid,
      name: user.displayName ?? 'Pengguna',
      photo: user.photoURL,
      joinedAt: Date.now(),
      role: 'member',
    };
    await update(ref(db, `groups/${id}/members/${user.uid}`), member);
    return { ...group, id };
  };

  const leaveGroup = async (groupId: string): Promise<void> => {
    if (!user) return;
    const db = getFirebaseDb();
    await remove(ref(db, `groups/${groupId}/members/${user.uid}`));
  };

  return { groups, activeGroupId, setActiveGroupId, createGroup, joinGroupByCode, leaveGroup };
}
