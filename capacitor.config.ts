import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vaishnav.vivaah',
  appName: 'Vaishnav Vivaah',
  webDir: 'out',
  // Development only: CAP_DEV=true (set by `npm run build:android`) lets the WebView
  // (origin https://localhost) call a plain-http dev API. `build:android:release` refuses it.
  android: {
    allowMixedContent: process.env.CAP_DEV === 'true',
  },
  server: {
    androidScheme: 'https',
    iosScheme: 'capacitor',
    cleartext: process.env.CAP_DEV === 'true',
  },
  plugins: {
    // Route fetch/XHR through the native HTTP stack: no CORS or mixed-content limits
    // in the WebView, and works for both the emulator and a physical device.
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
