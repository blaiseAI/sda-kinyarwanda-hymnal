import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.devseb.sdaKinyarwandaHymnal',
  appName: 'SDA Kinyarwanda Hymnal App',
  bundledWebRuntime: false,
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 3000,
    },
  },
  ios: {
    preferredContentMode: 'mobile',
  },
};

export default config;
