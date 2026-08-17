import React, { useEffect, useState } from 'react';
import { Music, Plus, Edit, Trash2, Search, X } from 'lucide-react';
import { songService } from '../../services/songService';
import { artistService } from '../../services/artistService';
import { albumService } from '../../services/albumService';
import { adminService } from '../../services/adminService';
import { Song, Artist, Album } from '../../types';

export const AdminSongsPage: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [artistId, setArtistId] = useState('');
  const [albumId, setAlbumId] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [duration, setDuration] = useState(180);
  const [lyrics, setLyrics] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [sList, aList, albList] = await Promise.all([
        songService.getSongs({ search }),
        artistService.getArtists(),
        albumService.getAlbums(),
      ]);
      setSongs(sList);
      setArtists(aList);
      setAlbums(albList);
      if (aList.length > 0) setArtistId(aList[0].id);
    } catch (err) {
      console.error('Failed to load songs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const handleOpenAddModal = () => {
    setEditingSong(null);
    setTitle('');
    setAudioUrl('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
    setCoverUrl('https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&q=80');
    setDuration(180);
    setLyrics('');
    if (artists.length > 0) setArtistId(artists[0].id);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (song: Song) => {
    setEditingSong(song);
    setTitle(song.title);
    setArtistId(song.artistId);
    setAlbumId(song.albumId || '');
    setAudioUrl(song.audioUrl);
    setCoverUrl(song.coverUrl || '');
    setDuration(song.duration);
    setLyrics(song.lyrics || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        artistId,
        albumId: albumId || undefined,
        audioUrl,
        coverUrl,
        duration: Number(duration),
        lyrics,
      };

      if (editingSong) {
        await adminService.updateSong(editingSong.id, payload);
      } else {
        await adminService.createSong(payload);
      }

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Failed to save song:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this song?')) return;
    try {
      await adminService.deleteSong(id);
      loadData();
    } catch (_e) {
      // Ignore
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">Song Management</h1>
            <p className="text-xs text-gray-400">Add, edit, or remove tracks from the catalog</p>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-2.5 rounded-full bg-gradient-primary hover:bg-gradient-hover text-white text-xs font-bold shadow-glow flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Song</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter songs by title..."
          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500/50"
        />
      </div>

      {/* Songs Table */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-gray-400 uppercase tracking-wider font-semibold border-b border-white/10">
              <tr>
                <th className="p-4">Track</th>
                <th className="p-4">Artist</th>
                <th className="p-4">Album</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Plays</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-400">Loading songs...</td>
                </tr>
              ) : songs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-400">No songs found.</td>
                </tr>
              ) : (
                songs.map((song) => (
                  <tr key={song.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={song.coverUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&q=80'}
                        alt={song.title}
                        className="w-9 h-9 rounded-lg object-cover"
                      />
                      <span className="font-bold text-white">{song.title}</span>
                    </td>
                    <td className="p-4 text-purple-400">{song.artist?.name || 'Unknown'}</td>
                    <td className="p-4 text-gray-400">{song.album?.title || '-'}</td>
                    <td className="p-4 text-gray-400">{Math.floor(song.duration / 60)}:{Math.floor(song.duration % 60).toString().padStart(2, '0')}</td>
                    <td className="p-4 text-gray-300">{song.playCount}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(song)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(song.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Song Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#141122] border border-white/10 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <h3 className="text-lg font-bold text-white">
                {editingSong ? 'Edit Song' : 'Add New Song'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Song Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Artist *</label>
                  <select
                    value={artistId}
                    onChange={(e) => setArtistId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1d1930] border border-white/10 rounded-xl text-white focus:outline-none"
                    required
                  >
                    {artists.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Album (Optional)</label>
                  <select
                    value={albumId}
                    onChange={(e) => setAlbumId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1d1930] border border-white/10 rounded-xl text-white focus:outline-none"
                  >
                    <option value="">-- No Album --</option>
                    {albums.map((alb) => (
                      <option key={alb.id} value={alb.id}>{alb.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Audio Stream URL *</label>
                <input
                  type="url"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Duration (Seconds)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Lyrics (Timed or Text)</label>
                <textarea
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-white/10 text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-gradient-primary text-white font-bold shadow-glow"
                >
                  Save Song
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
