import React, { useEffect, useState } from 'react';
import { Music, Plus, Edit, Trash2, Search, X, Youtube, Link as LinkIcon, Upload, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { songService } from '../../services/songService';
import { artistService } from '../../services/artistService';
import { albumService } from '../../services/albumService';
import { adminService } from '../../services/adminService';
import { Song, Artist, Album } from '../../types';
import { extractYouTubeVideoId, isValidYouTubeUrl, fetchYouTubeMetadata } from '../../utils/youtube';
import { AdminSongCard } from './components/AdminSongCard';

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
  const [sourceType, setSourceType] = useState<'UPLOAD' | 'DIRECT_URL' | 'YOUTUBE'>('DIRECT_URL');
  const [audioUrl, setAudioUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const [isYoutubeValid, setIsYoutubeValid] = useState<boolean | null>(null);
  const [coverUrl, setCoverUrl] = useState('');
  const [duration, setDuration] = useState(180);
  const [lyrics, setLyrics] = useState('');
  const [fetchingMetadata, setFetchingMetadata] = useState(false);

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

  // Handle YouTube URL change & live validation
  const handleYoutubeUrlChange = async (url: string) => {
    setYoutubeUrl(url);
    if (!url.trim()) {
      setYoutubeVideoId(null);
      setIsYoutubeValid(null);
      return;
    }

    const videoId = extractYouTubeVideoId(url);
    if (videoId) {
      setYoutubeVideoId(videoId);
      setIsYoutubeValid(true);

      // Auto-set thumbnail as cover if empty
      if (!coverUrl) {
        setCoverUrl(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
      }

      // Optionally fetch title & metadata
      setFetchingMetadata(true);
      const meta = await fetchYouTubeMetadata(videoId);
      if (meta) {
        if (!title && meta.title) setTitle(meta.title);
        if (meta.thumbnailUrl) setCoverUrl(meta.thumbnailUrl);
      }
      setFetchingMetadata(false);
    } else {
      setYoutubeVideoId(null);
      setIsYoutubeValid(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingSong(null);
    setTitle('');
    setSourceType('DIRECT_URL');
    setAudioUrl('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
    setYoutubeUrl('');
    setYoutubeVideoId(null);
    setIsYoutubeValid(null);
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
    const srcType = song.sourceType || (song.youtubeVideoId ? 'YOUTUBE' : 'DIRECT_URL');
    setSourceType(srcType);
    setAudioUrl(song.audioUrl || '');
    if (song.youtubeVideoId) {
      const ytUrl = `https://www.youtube.com/watch?v=${song.youtubeVideoId}`;
      setYoutubeUrl(ytUrl);
      setYoutubeVideoId(song.youtubeVideoId);
      setIsYoutubeValid(true);
    } else {
      setYoutubeUrl('');
      setYoutubeVideoId(null);
      setIsYoutubeValid(null);
    }
    setCoverUrl(song.coverUrl || '');
    setDuration(song.duration);
    setLyrics(song.lyrics || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (sourceType === 'YOUTUBE' && (!youtubeVideoId || !isYoutubeValid)) {
      alert('Please enter a valid YouTube URL before saving.');
      return;
    }

    try {
      const payload: Partial<Song> = {
        title,
        artistId,
        albumId: albumId || undefined,
        sourceType,
        audioUrl: sourceType === 'YOUTUBE' ? undefined : audioUrl,
        youtubeVideoId: sourceType === 'YOUTUBE' ? youtubeVideoId : undefined,
        coverUrl: coverUrl || (youtubeVideoId ? `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg` : undefined),
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
    } catch (err: any) {
      console.error('Failed to save song:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to save song. Please check required fields.';
      alert(msg);
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
            <p className="text-xs text-gray-400">Add & manage MP3 audio, Direct URLs, and YouTube stream sources</p>
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

      {/* Mobile Song Cards View (< md) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
        {loading ? (
          <p className="text-center text-gray-400 py-6">Loading songs...</p>
        ) : songs.length === 0 ? (
          <p className="text-center text-gray-400 py-6">No songs found.</p>
        ) : (
          songs.map((song) => (
            <AdminSongCard
              key={song.id}
              song={song}
              onEdit={handleOpenEditModal}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Desktop Songs Table (md+) */}
      <div className="hidden md:block glass-panel rounded-3xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-gray-400 uppercase tracking-wider font-semibold border-b border-white/10">
              <tr>
                <th className="p-4">Track</th>
                <th className="p-4">Source</th>
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
                  <td colSpan={7} className="p-6 text-center text-gray-400">Loading songs...</td>
                </tr>
              ) : songs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-400">No songs found.</td>
                </tr>
              ) : (
                songs.map((song) => {
                  const src = song.sourceType || (song.youtubeVideoId ? 'YOUTUBE' : 'DIRECT_URL');

                  return (
                    <tr key={song.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={song.coverUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&q=80'}
                          alt={song.title}
                          className="w-9 h-9 rounded-lg object-cover"
                        />
                        <span className="font-bold text-white">{song.title}</span>
                      </td>

                      {/* Source Badge */}
                      <td className="p-4">
                        {src === 'YOUTUBE' ? (
                          <span className="px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold flex items-center gap-1.5 w-fit text-[10px]">
                            <Youtube className="w-3 h-3 fill-current" />
                            <span>YouTube</span>
                          </span>
                        ) : src === 'UPLOAD' ? (
                          <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 font-bold flex items-center gap-1.5 w-fit text-[10px]">
                            <Upload className="w-3 h-3" />
                            <span>Upload</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-bold flex items-center gap-1.5 w-fit text-[10px]">
                            <LinkIcon className="w-3 h-3" />
                            <span>Direct URL</span>
                          </span>
                        )}
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Song Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#141122] border border-white/10 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
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
                  placeholder="e.g. Cyberpunk Neon Dreams"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-gray-300 font-semibold">Artist *</label>
                    <button
                      type="button"
                      onClick={async () => {
                        const name = window.prompt('Enter new Artist name:');
                        if (!name || !name.trim()) return;
                        try {
                          const newArtist = await artistService.createArtist({ name: name.trim() });
                          setArtists((prev) => [...prev, newArtist]);
                          setArtistId(newArtist.id);
                          alert(`Artist "${newArtist.name}" created successfully!`);
                        } catch (_err) {
                          alert('Failed to create artist.');
                        }
                      }}
                      className="text-[10px] text-purple-400 hover:text-purple-300 font-bold underline"
                    >
                      + New Artist
                    </button>
                  </div>
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

              {/* Music Source Selector */}
              <div className="space-y-2 p-3 bg-white/5 border border-white/10 rounded-2xl">
                <label className="block text-gray-300 font-bold uppercase tracking-wider text-[11px]">
                  Music Source *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <label
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border cursor-pointer font-bold transition-all ${
                      sourceType === 'UPLOAD'
                        ? 'bg-purple-600/30 border-purple-500 text-purple-300'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="sourceType"
                      value="UPLOAD"
                      checked={sourceType === 'UPLOAD'}
                      onChange={() => setSourceType('UPLOAD')}
                      className="sr-only"
                    />
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                  </label>

                  <label
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border cursor-pointer font-bold transition-all ${
                      sourceType === 'DIRECT_URL'
                        ? 'bg-cyan-600/30 border-cyan-500 text-cyan-300'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="sourceType"
                      value="DIRECT_URL"
                      checked={sourceType === 'DIRECT_URL'}
                      onChange={() => setSourceType('DIRECT_URL')}
                      className="sr-only"
                    />
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Direct URL</span>
                  </label>

                  <label
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border cursor-pointer font-bold transition-all ${
                      sourceType === 'YOUTUBE'
                        ? 'bg-red-600/30 border-red-500 text-red-300'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="sourceType"
                      value="YOUTUBE"
                      checked={sourceType === 'YOUTUBE'}
                      onChange={() => setSourceType('YOUTUBE')}
                      className="sr-only"
                    />
                    <Youtube className="w-3.5 h-3.5" />
                    <span>YouTube</span>
                  </label>
                </div>
              </div>

              {/* Source Type Specific Inputs */}
              {sourceType === 'YOUTUBE' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">
                      YouTube Link * (watch?v=, youtu.be/, shorts/)
                    </label>
                    <input
                      type="text"
                      value={youtubeUrl}
                      onChange={(e) => handleYoutubeUrlChange(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=XXXXXXXXXXX"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none"
                      required
                    />
                  </div>

                  {/* Validation Feedback */}
                  {isYoutubeValid === true && (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>✓ Valid YouTube Link</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">ID: {youtubeVideoId}</span>
                    </div>
                  )}

                  {isYoutubeValid === false && (
                    <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>Invalid YouTube Link. Check format and try again.</span>
                    </div>
                  )}

                  {/* YouTube Video Preview Frame */}
                  {youtubeVideoId && isYoutubeValid && (
                    <div className="space-y-1.5">
                      <label className="block text-gray-300 font-bold text-[11px] uppercase tracking-wider">
                        YouTube Video Preview
                      </label>
                      <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-black">
                        <iframe
                          src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                          title="YouTube Preview"
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : sourceType === 'UPLOAD' ? (
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Upload Audio File (MP3)</label>
                  <input
                    type="text"
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.target.value)}
                    placeholder="/uploads/audio/my-track.mp3"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none"
                    required
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Specify relative upload path or server audio URL.</p>
                </div>
              ) : (
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Direct Audio Stream URL *</label>
                  <input
                    type="url"
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.target.value)}
                    placeholder="https://example.com/audio.mp3"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  Cover Image URL {sourceType === 'YOUTUBE' && '(Auto-filled thumbnail)'}
                </label>
                <input
                  type="url"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
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
                  rows={3}
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
                  disabled={sourceType === 'YOUTUBE' && !isYoutubeValid}
                  className="flex-1 py-2 rounded-xl bg-gradient-primary text-white font-bold shadow-glow disabled:opacity-50"
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
