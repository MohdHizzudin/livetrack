import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mohdhizzudin.livetrack',
  appName: 'LiveTrack',
  webDir: 'out',
  android: {
    allowMixedContent: true,
  },
  plugins: {
    Geolocation: {
      permissions: ['location'],
    },
  },
};

export default config;
