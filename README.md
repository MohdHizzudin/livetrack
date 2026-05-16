# LiveTrack — Pengesan Orang Tersayang

Aplikasi pengesan lokasi langsung (livetrack) untuk keluarga & orang tersayang.
Mobile-first, PWA, dan boleh dibungkus jadi **APK Android** menggunakan Capacitor.

## Fungsi Utama

- **Google SSO** — log masuk sekali klik dengan Firebase Auth
- **Peta langsung** — lihat lokasi semua ahli keluarga dalam masa nyata (Leaflet + OpenStreetMap)
- **Kongsi lokasi** — butang besar untuk hidup/mati Live Share
- **Kumpulan keluarga** — cipta kumpulan, jemput ahli guna kod 6 aksara
- **Tempat selamat (geofence)** — tambah rumah/sekolah/pejabat, terima notifikasi bila ahli masuk/keluar
- **Butang SOS** — hantar amaran kecemasan dengan lokasi terkini kepada semua ahli
- **Sejarah perjalanan** — senarai titik lokasi 24 jam terakhir
- **Status bateri & kelajuan** — paparkan info kontekstual untuk setiap ahli
- **Admin Dashboard** — naikkan pengguna jadi admin, urus amaran SOS
- **PWA** — boleh dipasang di phone seperti aplikasi
- **APK** — bungkus jadi aplikasi Android melalui Capacitor + CI

## Susunan Teknologi

| Lapisan | Teknologi |
| --- | --- |
| Frontend | Next.js 15 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS + Lucide Icons |
| Peta | Leaflet + react-leaflet (OpenStreetMap, tiada API key diperlukan) |
| Auth & DB | Firebase Auth (Google SSO) + Firebase Realtime Database |
| Mobile | Capacitor 6 (Android) |
| CI/CD | GitHub Actions (build APK automatik) |

## Setup Tempatan

```bash
# 1. Pasang dependencies
npm install

# 2. Salin .env.example dan isi nilai Firebase anda
cp .env.example .env.local

# 3. Jalankan dev server
npm run dev
```

Buka http://localhost:3000 — aplikasi akan minta anda log masuk dengan Google.

### Konfigurasi Firebase

1. Buka [Firebase Console](https://console.firebase.google.com) → Add project (`livetrack`).
2. **Authentication** → Sign-in method → enable **Google**.
3. **Realtime Database** → Create database → start in test mode (kemaskini rules sebelum production).
4. **Project settings → Your apps** → tambah Web app → salin objek `firebaseConfig` ke `.env.local`.

Contoh `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=livetrack-xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://livetrack-xxx-default-rtdb.asia-southeast1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=livetrack-xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=livetrack-xxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abc123
```

### Rules Realtime Database (contoh)

```json
{
  "rules": {
    "users":           { "$uid": { ".read": "auth != null", ".write": "$uid === auth.uid" } },
    "liveLocations":   { ".read": "auth != null", "$uid": { ".write": "$uid === auth.uid" } },
    "locationHistory": { "$uid": { ".read": "$uid === auth.uid", ".write": "$uid === auth.uid" } },
    "places":          { "$uid": { ".read": "$uid === auth.uid", ".write": "$uid === auth.uid" } },
    "groups":          { ".read": "auth != null", ".write": "auth != null" },
    "sosAlerts":       { ".read": "auth != null", ".write": "auth != null" },
    "geofenceEvents":  { "$uid": { ".read": "$uid === auth.uid", ".write": "$uid === auth.uid" } }
  }
}
```

## Bina APK Android

CI akan auto-bina debug APK setiap kali push ke `main` atau PR baharu — muat turun dari tab **Actions → Build Android APK → Artifacts**.

Untuk bina secara tempatan (memerlukan Android SDK + Java 17):

```bash
# Bina static web export + sync ke Android
BUILD_TARGET=capacitor npm run build
npx cap sync android

# Bina debug APK
cd android
./gradlew assembleDebug
# Output: android/app/build/outputs/apk/debug/app-debug.apk
```

Untuk buka projek dalam Android Studio:

```bash
npx cap open android
```

## Struktur Projek

```
app/
  page.tsx                — Skrin login (Google SSO)
  layout.tsx              — Root layout + PWA meta
  (app)/                  — Authenticated app shell (sidebar + bottom nav)
    map/page.tsx          — Peta langsung
    family/page.tsx       — Pengurusan kumpulan keluarga
    places/page.tsx       — Tempat selamat (geofence)
    history/page.tsx      — Sejarah perjalanan
    profile/page.tsx      — Profil + tetapan
  admin/                  — Admin dashboard
components/
  MapView.tsx             — Peta Leaflet (avatar markers + geofence circles)
  BottomNav.tsx           — Navigasi bawah (mobile)
  Sidebar.tsx             — Sidebar (desktop)
  SosButton.tsx           — Butang SOS + dialog pengesahan
  AuthGate.tsx            — Gate untuk laluan terlindung
hooks/
  useAuth.ts              — Auth state + sign-in/out
  useLocation.ts          — Live location sharing
  useFamilyGroup.ts       — Cipta/sertai kumpulan
  useFamilyLocations.ts   — Dengar lokasi ahli keluarga
  useGeofences.ts         — Tempat selamat + amaran masuk/keluar
  useBattery.ts           — Status bateri
lib/
  firebase.ts             — Firebase client (lazy init)
  geo.ts                  — Haversine, format, kod jemputan
  types.ts                — Jenis data berkongsi
android/                  — Projek Capacitor Android
```

## Skrip NPM

| Skrip | Tujuan |
| --- | --- |
| `npm run dev` | Server development Next.js |
| `npm run build` | Bina production (set `BUILD_TARGET=capacitor` untuk static export APK) |
| `npm run lint` | Periksa lint |
| `npm run typecheck` | Periksa jenis TypeScript |
| `npm run cap:sync` | Bina dan sync ke Android |
| `npm run android:build` | Bina debug APK end-to-end |

## Deploy Web

Mana-mana penyedia static host (Vercel, Netlify, Firebase Hosting, Cloudflare Pages).
Pastikan environment variable `NEXT_PUBLIC_FIREBASE_*` ditetapkan.
