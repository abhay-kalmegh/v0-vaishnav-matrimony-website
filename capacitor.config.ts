import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vaishnav.vivaah',
  appName: 'Vaishnav Vivaah',
  webDir: 'out',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    hostname: 'localhost',
    iosScheme: 'capacitor',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: '#FFF9F0',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      spinnerColor: '#C4582B',
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#C4582B',
      sound: 'beep.wav',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
