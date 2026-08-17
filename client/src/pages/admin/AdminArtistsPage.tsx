import React, { useEffect, useState } from 'react';
import { Mic2, Plus, Edit, Trash2, Search, X, BadgeCheck } from 'lucide-react';
import { artistService } from '../../services/artistService';
import { adminService } from '../../services/adminService';
import { Artist } from '../../types';

export const AdminArtistsPage: React.FC = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);

  const [name, setName] = useState('');
  const [biography, setBiography] = useState('');
  const [country, setCountry] = useState('');
  const [avatar, setAvatar] = useState('');
  const [verified, setVerified] = useState(true);

  const loadArtists = async () => {
    setLoading(true);
    try {
      const data = await artistService.getArtists({ search });
      setArtists(data);
    } catch (err) {
      console.error('Failed to load artists:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArtists();
  }, [search]);

  const handleOpenAdd = () => {
    setEditingArtist(null);
    setName('');
    setBiography('');
    setCountry('United States');
    setAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80');
    setVerified(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (a: Artist) => {
    setEditingArtist(a);
    setName(a.name);
    setBiography(a.biography || '');
    setCountry(a.country || '');
    setAvatar(a.avatar || '');
    setVerified(a.verified);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { name, biography, country, avatar, verified };
      if (editingArtist) {
        await adminService.updateArtist(editingArtist.id, payload);
      } else {
        await adminService.createArtist(payload);
      }
      setIsModalOpen(false);
      loadArtists();
    } catch (err) {
      console.error('Failed to save artist:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete artist profile?')) return;
    try {
      await adminService.deleteArtist(id);
      loadArtists();
    } catch (_e) {
      // Ignore
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-pink-500/10 text-pink-400">
            <Mic2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">Artist Management</h1>
            <p className="text-xs text-gray-400">Create & update creator profiles</p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-full bg-gradient-primary text-white text-xs font-bold shadow-glow flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Artist</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter artists by name..."
          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
        />
      </div>

      {/* Artists Table */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-gray-400 uppercase tracking-wider font-semibold border-b border-white/10">
              <tr>
                <th className="p-4">Artist</th>
                <th className="p-4">Country</th>
                <th className="p-4">Verified</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-400">Loading artists...</td>
                </tr>
              ) : artists.map((a) => (
                <tr key={a.id} className="hover:bg-white/5">
                  <td className="p-4 flex items-center gap-3">
                    <img src={a.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'} alt={a.name} className="w-9 h-9 rounded-full object-cover" />
                    <span className="font-bold text-white">{a.name}</span>
                  </td>
                  <td className="p-4 text-gray-400">{a.country || '-'}</td>
                  <td className="p-4">
                    {a.verified ? <BadgeCheck className="w-4 h-4 text-purple-400" /> : <span className="text-gray-500">No</span>}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleOpenEdit(a)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141122] border border-white/10 rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <h3 className="text-lg font-bold text-white">{editingArtist ? 'Edit Artist' : 'Add Artist'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Artist Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none" required />
              </div>
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Country</label>
                <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Avatar Image URL</label>
                <input type="url" value={avatar} onChange={(e) => setAvatar(e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Biography</label>
                <textarea value={biography} onChange={(e) => setBiography(e.target.value)} rows={3} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none resize-none" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="ver" checked={verified} onChange={(e) => setVerified(e.target.checked)} />
                <label htmlFor="ver" className="text-gray-300">Verified Artist Badge</label>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 rounded-xl border border-white/10 text-gray-300">Cancel</button>
                <button type="submit" className="flex-1 py-2 rounded-xl bg-gradient-primary text-white font-bold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
