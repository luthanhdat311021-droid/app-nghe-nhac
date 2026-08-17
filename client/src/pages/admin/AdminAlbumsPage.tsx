import React, { useEffect, useState } from 'react';
import { Disc, Plus, Edit, Trash2, Search, X } from 'lucide-react';
import { albumService } from '../../services/albumService';
import { artistService } from '../../services/artistService';
import { adminService } from '../../services/adminService';
import { Album, Artist } from '../../types';

export const AdminAlbumsPage: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);

  const [title, setTitle] = useState('');
  const [artistId, setArtistId] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [releaseDate, setReleaseDate] = useState('2025-05-15');
  const [description, setDescription] = useState('');

  const loadAlbums = async () => {
    setLoading(true);
    try {
      const [albList, aList] = await Promise.all([
        albumService.getAlbums({ search }),
        artistService.getArtists(),
      ]);
      setAlbums(albList);
      setArtists(aList);
      if (aList.length > 0) setArtistId(aList[0].id);
    } catch (err) {
      console.error('Failed to load albums:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlbums();
  }, [search]);

  const handleOpenAdd = () => {
    setEditingAlbum(null);
    setTitle('');
    setCoverUrl('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80');
    setReleaseDate('2025-05-15');
    setDescription('');
    if (artists.length > 0) setArtistId(artists[0].id);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (alb: Album) => {
    setEditingAlbum(alb);
    setTitle(alb.title);
    setArtistId(alb.artistId);
    setCoverUrl(alb.coverUrl || '');
    setReleaseDate(alb.releaseDate || '2025-05-15');
    setDescription(alb.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { title, artistId, coverUrl, releaseDate, description };
      if (editingAlbum) {
        await adminService.updateAlbum(editingAlbum.id, payload);
      } else {
        await adminService.createAlbum(payload);
      }
      setIsModalOpen(false);
      loadAlbums();
    } catch (err) {
      console.error('Failed to save album:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete album?')) return;
    try {
      await adminService.deleteAlbum(id);
      loadAlbums();
    } catch (_e) {
      // Ignore
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400">
            <Disc className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">Album Management</h1>
            <p className="text-xs text-gray-400">Create & manage studio albums</p>
          </div>
        </div>

        <button onClick={handleOpenAdd} className="px-5 py-2.5 rounded-full bg-gradient-primary text-white text-xs font-bold shadow-glow flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Add Album</span>
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter albums by title..."
          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
        />
      </div>

      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-gray-400 uppercase tracking-wider font-semibold border-b border-white/10">
              <tr>
                <th className="p-4">Album</th>
                <th className="p-4">Artist</th>
                <th className="p-4">Release Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-400">Loading albums...</td>
                </tr>
              ) : albums.map((alb) => (
                <tr key={alb.id} className="hover:bg-white/5">
                  <td className="p-4 flex items-center gap-3">
                    <img src={alb.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&q=80'} alt={alb.title} className="w-9 h-9 rounded-lg object-cover" />
                    <span className="font-bold text-white">{alb.title}</span>
                  </td>
                  <td className="p-4 text-purple-400">{alb.artist?.name || 'Unknown'}</td>
                  <td className="p-4 text-gray-400">{alb.releaseDate || '-'}</td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleOpenEdit(alb)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(alb.id)} className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141122] border border-white/10 rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <h3 className="text-lg font-bold text-white">{editingAlbum ? 'Edit Album' : 'Add Album'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Album Title *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none" required />
              </div>
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Artist *</label>
                <select value={artistId} onChange={(e) => setArtistId(e.target.value)} className="w-full px-3 py-2 bg-[#1d1930] border border-white/10 rounded-xl text-white focus:outline-none" required>
                  {artists.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Cover Image URL</label>
                <input type="url" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Release Date</label>
                <input type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none resize-none" />
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
