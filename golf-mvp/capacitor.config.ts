import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tugolf.app',
  appName: 'GolfMVP',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
