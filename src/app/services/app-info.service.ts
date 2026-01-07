import { Injectable } from '@angular/core';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class AppInfoService {
  private appVersion: string = '1.10'; // Fallback version
  private appName: string = 'SDA Kinyarwanda Hymnal';
  private appInfoLoaded: Promise<void>;

  constructor() {
    this.appInfoLoaded = this.loadAppInfo();
  }

  private async loadAppInfo(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        const appInfo = await App.getInfo();
        this.appVersion = appInfo.version;
        this.appName = appInfo.name;
      }
    } catch (error) {
      console.warn('Could not load app info from native platform:', error);
      // Use fallback values
    }
  }

  getAppDescription(): string {
    const description = 'Indirimbo Zo Guhimbaza Imana';
    return description;
  }

  async getAppName(): Promise<string> {
    await this.appInfoLoaded;
    return this.appName;
  }

  async getAppVersion(): Promise<string> {
    await this.appInfoLoaded;
    return this.appVersion;
  }

  // Synchronous getters for backwards compatibility (returns fallback immediately)
  getAppNameSync(): string {
    return this.appName;
  }

  getAppVersionSync(): string {
    return this.appVersion;
  }

  getGithubUrl(): string {
    return 'https://github.com/myusername/my-app';
  }

  getTwitterUrl(): string {
    return 'https://twitter.com/myapp';
  }
  isMobile(): boolean {
    return window.innerWidth < 768;
  }
}
