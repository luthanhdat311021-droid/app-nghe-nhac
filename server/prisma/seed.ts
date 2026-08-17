import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Reliable public-domain audio sample streams for testing HTML5 audio player
const AUDIO_SAMPLES = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
];

const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
];

const ARTIST_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&auto=format&fit=crop&q=80',
];

async function main() {
  console.log('🌱 Starting MusicWave database seed...');

  // Clean existing tables
  await prisma.recentlyPlayed.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.playlistSong.deleteMany();
  await prisma.playlist.deleteMany();
  await prisma.lyric.deleteMany();
  await prisma.follower.deleteMany();
  await prisma.song.deleteMany();
  await prisma.album.deleteMany();
  await prisma.artist.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@musicwave.com',
      password: adminPassword,
      role: 'ADMIN',
      avatar: ARTIST_AVATARS[0],
      bio: 'MusicWave Chief System Administrator & Curator.',
    },
  });

  const createdUsers = [admin];

  for (let i = 1; i <= 10; i++) {
    const u = await prisma.user.create({
      data: {
        username: `listener_${i}`,
        email: `user${i}@musicwave.com`,
        password: userPassword,
        role: 'USER',
        avatar: ARTIST_AVATARS[i % ARTIST_AVATARS.length],
        bio: `Passionate music enthusiast & playlist creator #${i}.`,
      },
    });
    createdUsers.push(u);
  }

  // 2. Create Genres
  const genreData = [
    { name: 'Pop', slug: 'pop', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80' },
    { name: 'Synthwave', slug: 'synthwave', image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&q=80' },
    { name: 'Lofi Chill', slug: 'lofi', image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&q=80' },
    { name: 'Electronic', slug: 'electronic', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80' },
    { name: 'Hip-Hop', slug: 'hip-hop', image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&q=80' },
    { name: 'R&B / Soul', slug: 'r-n-b', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80' },
    { name: 'Indie Rock', slug: 'indie', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&q=80' },
    { name: 'Ambient', slug: 'ambient', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80' },
  ];

  const createdGenres = [];
  for (const g of genreData) {
    const createdG = await prisma.genre.create({ data: g });
    createdGenres.push(createdG);
  }

  // 3. Create Artists
  const artistSeedList = [
    { name: 'Neon Horizon', bio: 'Pioneer of futuristic synthwave and cybernetic electronica.', country: 'United States', verified: true },
    { name: 'Cyber Echo', bio: 'Dark synth, heavy baselines, and atmospheric cinematic textures.', country: 'Sweden', verified: true },
    { name: 'Lofi Chillwave', bio: 'Cozy beats to relax, study, and code to.', country: 'Japan', verified: true },
    { name: 'Velvet Aura', bio: 'Silky smooth modern R&B vocal melodies and atmospheric production.', country: 'Canada', verified: true },
    { name: 'Electric Dream', bio: 'High energy dance anthems and neon festival sounds.', country: 'United Kingdom', verified: true },
    { name: 'Midnight Odyssey', bio: 'Retro 80s nostalgia mixed with modern pop sensibility.', country: 'France', verified: false },
    { name: 'Solar Flare', bio: 'Melodic progressive house and uplifting electronic soundscapes.', country: 'Germany', verified: true },
    { name: 'Starlight Symphony', bio: 'Orchestral ambient soundscapes for deep focus and meditation.', country: 'Norway', verified: false },
    { name: 'Bass Dynasty', bio: 'Futuristic trap, heavy bass, and underground hip-hop sounds.', country: 'United States', verified: true },
    { name: 'Acoustic Nomad', bio: 'Warm indie acoustic vibes and soulful vocal storytelling.', country: 'Australia', verified: true },
  ];

  const createdArtists = [];
  for (let i = 0; i < artistSeedList.length; i++) {
    const a = await prisma.artist.create({
      data: {
        name: artistSeedList[i].name,
        biography: artistSeedList[i].bio,
        country: artistSeedList[i].country,
        verified: artistSeedList[i].verified,
        avatar: ARTIST_AVATARS[i % ARTIST_AVATARS.length],
      },
    });
    createdArtists.push(a);
  }

  // 4. Create Albums
  const albumSeedList = [
    { title: 'Neon Nights 2099', year: '2025', artistIdx: 0, genreIdx: 1 },
    { title: 'Cybernetic Genesis', year: '2024', artistIdx: 1, genreIdx: 1 },
    { title: 'Midnight Study Session', year: '2025', artistIdx: 2, genreIdx: 2 },
    { title: 'Silk & Shadows', year: '2024', artistIdx: 3, genreIdx: 5 },
    { title: 'Pulse of the City', year: '2025', artistIdx: 4, genreIdx: 3 },
    { title: 'Overdrive', year: '2024', artistIdx: 0, genreIdx: 1 },
    { title: 'Solitude in Tokyo', year: '2025', artistIdx: 2, genreIdx: 2 },
    { title: 'Starlight Horizons', year: '2024', artistIdx: 5, genreIdx: 0 },
    { title: 'Solar Eclipse', year: '2025', artistIdx: 6, genreIdx: 3 },
    { title: 'Cosmic Awakening', year: '2024', artistIdx: 7, genreIdx: 7 },
    { title: 'Urban Velocity', year: '2025', artistIdx: 8, genreIdx: 4 },
    { title: 'Golden Hour Memories', year: '2024', artistIdx: 9, genreIdx: 6 },
    { title: 'Retrowave Drive', year: '2025', artistIdx: 5, genreIdx: 1 },
    { title: 'Ethereal Waves', year: '2024', artistIdx: 7, genreIdx: 7 },
    { title: 'Thunderdome', year: '2025', artistIdx: 8, genreIdx: 4 },
    { title: 'Lucid Dreams', year: '2024', artistIdx: 3, genreIdx: 5 },
    { title: 'Digital Odyssey', year: '2025', artistIdx: 1, genreIdx: 1 },
    { title: 'Summer Breeze', year: '2024', artistIdx: 9, genreIdx: 6 },
    { title: 'Supernova', year: '2025', artistIdx: 6, genreIdx: 3 },
    { title: 'After Hours', year: '2024', artistIdx: 4, genreIdx: 0 },
  ];

  const createdAlbums = [];
  for (let i = 0; i < albumSeedList.length; i++) {
    const albData = albumSeedList[i];
    const album = await prisma.album.create({
      data: {
        title: albData.title,
        coverUrl: COVER_IMAGES[i % COVER_IMAGES.length],
        releaseDate: `${albData.year}-05-15`,
        description: `Official studio album by ${createdArtists[albData.artistIdx].name}.`,
        artistId: createdArtists[albData.artistIdx].id,
      },
    });
    createdAlbums.push(album);
  }

  // 5. Create 50 Songs
  const songTitles = [
    'Midnight Cyber City', 'Echoes of Neon', 'Tokyo Rain Lofi', 'Velvet Moonlight',
    'Electronic Pulse', 'Starlight Drive', 'Solar Flare Anthem', 'Cosmic Meditation',
    'Urban Bass Drop', 'Coffee & Raindrops', 'Retro Horizon', 'Cyberpunk Alley',
    'Cozy Night Cafe', 'Silky Soul Serenade', 'Hyperdrive 9000', 'Sunset Boulevard',
    'Prismatic Light', 'Deep Space Ambient', 'Streetwise Rhythms', 'Acoustic Memories',
    'Neon Velocity', 'Digital Shadow', 'Study & Relax', 'Midnight Whispers',
    'Synthwave Dreams', 'Overdrive Rush', 'Lunar Reflection', 'Chasing Aurora',
    'Subwoofer Symphony', 'Summer Fireside', 'Electric Passion', 'Virtual Reality',
    'Rainy Window Pane', 'Midnight Groove', 'Galactic Highway', 'Timeless Retro',
    'Floating in Ether', 'Skyline Reverie', 'Bassline Revolution', 'Wildflower Bloom',
    'Cybernetic Soul', 'Chilly Autumn Air', 'Golden Hour Glow', 'Synthesizer Magic',
    'Hypnotic Beat', 'Velvet Touch', 'Infinity Loop', 'Starlight Reverie',
    'Metropolis Skyline', 'Final Countdown synth',
  ];

  const sampleLyricsText = `[00:00.00] (Instrumental Intro)
[00:15.00] Walking through the neon lights in the midnight rain
[00:25.00] Shadows calling out my name again
[00:35.00] Feel the synthetic pulse in your bloodstream
[00:45.00] Lost inside this cybernetic dream
[01:05.00] (Synthesizer Chorus Drop)
[01:25.00] We ride the frequency into the dawn
[01:38.00] Together until the night is gone...`;

  const createdSongs = [];
  for (let i = 0; i < songTitles.length; i++) {
    const artist = createdArtists[i % createdArtists.length];
    const album = createdAlbums[i % createdAlbums.length];
    const genre = createdGenres[i % createdGenres.length];
    const audioUrl = AUDIO_SAMPLES[i % AUDIO_SAMPLES.length];
    const coverUrl = COVER_IMAGES[i % COVER_IMAGES.length];

    const song = await prisma.song.create({
      data: {
        title: songTitles[i],
        duration: 180 + (i * 7) % 120, // 3 to 5 minutes
        audioUrl,
        coverUrl,
        lyrics: sampleLyricsText,
        releaseDate: '2025-01-20',
        playCount: Math.floor(Math.random() * 5000) + 120,
        artistId: artist.id,
        albumId: album.id,
        genreId: genre.id,
      },
    });
    createdSongs.push(song);
  }

  // 6. Create Featured Playlists & Playlist Songs
  const playlistTitles = [
    'Synthwave & Cyberpunk 2099',
    'Lofi Beats for Coding & Focus',
    'Top 50 Global Wave Charts',
    'Late Night R&B Moods',
    'High Energy Workout Electronic',
  ];

  for (let i = 0; i < playlistTitles.length; i++) {
    const pl = await prisma.playlist.create({
      data: {
        name: playlistTitles[i],
        description: `Handpicked selection of tracks by MusicWave curators for ${playlistTitles[i]}.`,
        coverUrl: COVER_IMAGES[(i + 3) % COVER_IMAGES.length],
        isPublic: true,
        userId: admin.id,
      },
    });

    // Add 8 random songs to playlist
    for (let j = 0; j < 8; j++) {
      const songIdx = (i * 8 + j) % createdSongs.length;
      await prisma.playlistSong.create({
        data: {
          playlistId: pl.id,
          songId: createdSongs[songIdx].id,
          order: j + 1,
        },
      });
    }
  }

  // 7. Seed Favorites & History for users
  for (const u of createdUsers) {
    // Each user likes 4 random songs
    for (let f = 0; f < 4; f++) {
      const randomSong = createdSongs[Math.floor(Math.random() * createdSongs.length)];
      try {
        await prisma.favorite.create({
          data: {
            userId: u.id,
            songId: randomSong.id,
          },
        });
      } catch (_e) {
        // Skip duplicate unique constraint
      }
    }

    // Each user has 5 recently played tracks
    for (let h = 0; h < 5; h++) {
      const randomSong = createdSongs[Math.floor(Math.random() * createdSongs.length)];
      await prisma.recentlyPlayed.create({
        data: {
          userId: u.id,
          songId: randomSong.id,
        },
      });
    }
  }

  console.log('✅ Database successfully seeded with:');
  console.log(`- ${createdUsers.length} Users (Admin: admin@musicwave.com / admin123)`);
  console.log(`- ${createdGenres.length} Genres`);
  console.log(`- ${createdArtists.length} Artists`);
  console.log(`- ${createdAlbums.length} Albums`);
  console.log(`- ${createdSongs.length} Songs with HTML5 playable URLs`);
  console.log(`- Featured Playlists, Favorites, and Listening History`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
