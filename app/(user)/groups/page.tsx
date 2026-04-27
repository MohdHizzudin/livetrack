'use client';
import { useState, useEffect } from 'react';
import { ref, push, update, onValue } from 'firebase/database';
import { database, auth } from '@/lib/firebase';

export default function GroupsPage() {
  const [groupName, setGroupName] = useState('');
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;   // ← Tambahan penting

    const groupsRef = ref(database, 'groups');
    onValue(groupsRef, (snap) => {
      const data = snap.val();
      if (data) {
        const myGroups = Object.entries(data).filter(([_, g]: any) => 
          // ← Fix TypeScript: pastikan uid wujud sebelum guna sebagai key
          g.members && auth.currentUser?.uid && g.members[auth.currentUser.uid]
        );
        setGroups(myGroups);
      }
    });
  }, []);

  const createGroup = async () => {
    if (!groupName || !auth.currentUser) return;
    
    const newGroupRef = push(ref(database, 'groups'));
    await update(newGroupRef, {
      name: groupName,
      createdBy: auth.currentUser.uid,
      members: { [auth.currentUser.uid]: true },
      createdAt: Date.now()
    });
    
    setGroupName('');
  };

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Kumpulan Saya</h1>
      
      <div className="flex gap-4 mb-10 max-w-md">
        <input
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Nama kumpulan baru..."
          className="flex-1 px-6 py-4 border rounded-3xl focus:outline-none focus:border-indigo-500"
        />
        <button
          onClick={createGroup}
          className="bg-indigo-600 text-white px-10 rounded-3xl font-semibold"
        >
          Buat
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map(([id, group]: any) => (
          <div key={id} className="bg-white p-6 rounded-3xl shadow hover:shadow-xl transition">
            <h3 className="font-semibold text-2xl">{group.name}</h3>
            <p className="text-sm text-gray-500 mt-1">
              Ahli: {Object.keys(group.members || {}).length}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
