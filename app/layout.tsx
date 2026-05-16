import type { Metadata, Viewport } from 'next';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import './globals.css';

export const metadata: Metadata = {
  title: 'LiveTrack — Pengesan Orang Tersayang',
  description:
    'Aplikasi pengesan lokasi langsung untuk keluarga & orang tersayang. Mudah, selamat & mobile-friendly.',
  manifest: '/manifest.webmanifest',
  applicationName: 'LiveTrack',
  appleWebApp: {
    capable: true,
    title: 'LiveTrack',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#4f46e5',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ms">
      <body className="min-h-screen antialiased">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
