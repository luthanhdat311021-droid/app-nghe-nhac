import React, { useEffect, useState } from 'react';
import { Users, Search, Lock, Unlock, Shield, Trash2 } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { User } from '../../types';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers({ search });
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search]);

  const handleToggleLock = async (user: User) => {
    try {
      await adminService.toggleLockUser(user.id, !user.isLocked);
      loadUsers();
    } catch (_e) {
      // Ignore
    }
  };

  const handleToggleRole = async (user: User) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!window.confirm(`Change ${user.username}'s role to ${newRole}?`)) return;
    try {
      await adminService.updateUserRole(user.id, newRole);
      loadUsers();
    } catch (_e) {
      // Ignore
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account?')) return;
    try {
      await adminService.deleteUser(id);
      loadUsers();
    } catch (_e) {
      // Ignore
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">User Management</h1>
            <p className="text-xs text-gray-400">Manage user accounts, security lockouts, and permissions</p>
          </div>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter users by username or email..."
          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
        />
      </div>

      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-gray-400 uppercase tracking-wider font-semibold border-b border-white/10">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-400">Loading user accounts...</td>
                </tr>
              ) : users.map((u) => (
                <tr key={u.id} className="hover:bg-white/5">
                  <td className="p-4 flex items-center gap-3">
                    <img src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'} alt={u.username} className="w-9 h-9 rounded-full object-cover" />
                    <span className="font-bold text-white">{u.username}</span>
                  </td>
                  <td className="p-4 text-gray-300">{u.email}</td>
                  <td className="p-4">
                    <button onClick={() => handleToggleRole(u)} className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                      u.role === 'ADMIN' ? 'bg-pink-500/20 border-pink-500/30 text-pink-300' : 'bg-purple-500/10 border-purple-500/20 text-purple-300'
                    }`}>
                      {u.role}
                    </button>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      u.isLocked ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {u.isLocked ? 'Locked' : 'Active'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleToggleLock(u)}
                      className={`p-1.5 rounded-lg border transition-all ${
                        u.isLocked ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      }`}
                      title={u.isLocked ? 'Unlock Account' : 'Lock Account'}
                    >
                      {u.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                      title="Delete User"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
