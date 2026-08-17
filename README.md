# MusicWave - Modern Music Streaming Web Application 🎵

MusicWave is a full-stack, feature-rich modern music streaming web application designed with a dark-first aesthetic, fluid glassmorphism UI, real-time HTML5 audio playback system, and a comprehensive Admin Management Dashboard.

---

## 1. Project Overview

MusicWave gives users a premium music streaming experience similar to Spotify or Apple Music while maintaining a unique neon dark design system.

### Key Capabilities
- **Real-Time HTML5 Audio Engine**: Track progress seek bar, volume control, mute, play queue drawer, repeat modes (`off`, `all`, `one`), and shuffle playback.
- **Synchronized Lyrics**: Interactive lyrics modal supporting timestamped lyrics (`[mm:ss.xx]`) synced with track playback time.
- **Authentication**: Secure JWT token authentication with bcrypt password hashing and user profiles.
- **My Library & Playlists**: Create, update, delete, and manage custom playlists. Add/remove tracks with instant state sync.
- **Favorites & History**: Like tracks to save to Favorites, and track recently played streams automatically.
- **Multi-Entity Search**: Live debounced search across songs, artists, albums, and playlists.
- **Admin Dashboard**: System metrics overview, top streamed tracks table, and complete CRUD management for Songs, Artists, Albums, and User accounts.

---

## 2. Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (Dark theme design system with modern glassmorphism & gradients)
- **Icons**: Lucide React
- **State Management**: Zustand
- **HTTP Client**: Axios (with Bearer token request interceptor)
- **Routing**: React Router v6

### Backend
- **Runtime**: Node.js + Express.js + TypeScript
- **Database ORM**: Prisma ORM
- **Database Engine**: SQLite (default zero-config local file) / PostgreSQL compliant
- **Authentication**: JSON Web Token (JWT) & bcryptjs
- **File Uploads**: Multer middleware

---

## 3. Project Structure

```text
MusicWave/
│
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/         # Layouts, Player, Modals, Cards, Lists
│   │   ├── hooks/              # useAudioPlayer hook & keyboard shortcuts
│   │   ├── pages/              # Home, Explore, Search, Library, Favorites, Admin pages
│   │   ├── services/           # Axios API services
│   │   ├── store/              # Zustand stores (usePlayerStore, useAuthStore)
│   │   ├── types/              # TypeScript interfaces
│   │   ├── App.tsx             # Route mapping
│   │   └── main.tsx            # App entry point
│   └── package.json
│
├── server/                     # Express + Prisma Backend
│   ├── prisma/
│   │   ├── schema.prisma       # Database Schema definition
│   │   └── seed.ts             # Database seeding script (Admin, Users, Songs, Lyrics)
│   ├── src/
│   │   ├── config/             # DB & Environment config
│   │   ├── controllers/        # Express controllers (Auth, Song, Artist, Album, Playlist, Admin)
│   │   ├── middleware/         # Auth, Admin role check, Error handler
│   │   ├── routes/             # REST API routers
│   │   └── server.ts           # Express server entry point
│   └── package.json
│
├── README.md
└── package.json
```

---

## 4. Installation & Getting Started

### Prerequisites
- Node.js v18+ installed

### Step-by-Step Quick Setup

1. **Install All Monorepo Dependencies**:
   ```bash
   npm run setup
   ```
   *Or install individually:*
   ```bash
   npm --prefix server install
   npm --prefix client install
   ```

2. **Setup Environment Variables**:
   In `server/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="musicwave_super_secret_jwt_key_2026"
   JWT_EXPIRES_IN="7d"
   CLIENT_URL="http://localhost:5173"
   ```

3. **Database Migration & Seeding**:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Run Development Servers**:
   ```bash
   npm run dev
   ```
   - **Frontend**: http://localhost:5173/
   - **Backend API**: http://localhost:5000/

---

## 5. Default Credentials

### System Administrator Account
- **Email**: `admin@musicwave.com`
- **Password**: `admin123`
- **Role**: `ADMIN` (Access to `/admin` panel)

### Standard User Account
- **Email**: `user1@musicwave.com`
- **Password**: `user123`
- **Role**: `USER`

---

## 6. API Documentation Quick Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account |
| `POST` | `/api/auth/login` | Login user & receive JWT token |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |
| `GET` | `/api/songs` | List songs (supports search & genre filter) |
| `GET` | `/api/songs/trending` | Get top streamed songs |
| `POST` | `/api/songs/:id/play` | Record play count for a track |
| `GET` | `/api/playlists/me` | Get current user's playlists |
| `POST` | `/api/playlists` | Create a new playlist |
| `POST` | `/api/favorites/:songId` | Toggle song favorite |
| `GET` | `/api/search?q=` | Global search across songs, artists, albums, playlists |
| `GET` | `/api/admin/stats` | Admin system metrics overview |

---

## 7. Build for Production

To build production bundles for both frontend and backend:

```bash
npm run build
```

- Server output compiled to `server/dist`
- Client output bundled to `client/dist`

---

## 8. Keyboard Shortcuts (Audio Player)

- **Spacebar**: Toggle Play / Pause
- **Right Arrow (`→`)**: Skip 5 seconds forward
- **Left Arrow (`←`)**: Skip 5 seconds backward
- **Up Arrow (`↑`)**: Increase Volume by 10%
- **Down Arrow (`↓`)**: Decrease Volume by 10%
